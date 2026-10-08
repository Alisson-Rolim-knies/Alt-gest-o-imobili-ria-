import {neon} from '@neondatabase/serverless';
export function createStore(databaseUrl){
 const sql=neon(databaseUrl);
 return {
  async rate(key){const [r]=await sql`INSERT INTO proposal_rate_limits(key,count,expires_at) VALUES(${key},1,now()+interval '1 hour') ON CONFLICT(key) DO UPDATE SET count=CASE WHEN proposal_rate_limits.expires_at<now() THEN 1 ELSE proposal_rate_limits.count+1 END,expires_at=CASE WHEN proposal_rate_limits.expires_at<now() THEN now()+interval '1 hour' ELSE proposal_rate_limits.expires_at END RETURNING count`;await sql`DELETE FROM proposal_rate_limits WHERE expires_at<now()-interval '1 day'`;return r.count<=8},
  async find(key){const [r]=await sql`SELECT * FROM proposal_requests WHERE submission_key=${key}::uuid`;return r},
  async get(id){const [r]=await sql`SELECT * FROM proposal_requests WHERE id=${id}::uuid`;return r},
  async save(row){const [r]=await sql`INSERT INTO proposal_requests(id,submission_key,protocol,condominio,responsavel,telefone,email,units,answers,consent_version) VALUES(${row.id}::uuid,${row.submission_key}::uuid,${row.protocol},${row.answers.condominio},${row.answers.responsavel},${row.answers.telefone},${row.answers.email},${row.units},${JSON.stringify(row.answers)}::jsonb,'2026-10-08') ON CONFLICT(submission_key) DO NOTHING RETURNING *`;return r||await this.find(row.submission_key)},
  async claim(id){const [r]=await sql`UPDATE proposal_requests SET notification_state='sending',notification_attempts=notification_attempts+1,notification_lock_until=now()+interval '2 minutes',notification_updated_at=now() WHERE id=${id}::uuid AND notification_state<>'sent' AND (notification_lock_until IS NULL OR notification_lock_until<now()) RETURNING *`;return r},
  async result(id,state){await sql`UPDATE proposal_requests SET notification_state=${state},notification_lock_until=NULL,notification_updated_at=now() WHERE id=${id}::uuid`}
 }
}
