// Implementação do envio de e-mail usando EmailJS
document.addEventListener('DOMContentLoaded', function () {
    // Inicialização do EmailJS
    function setupEmailService() {
        // Inicializa o serviço EmailJS
        // Nota: Em um ambiente de produção, você precisaria criar uma conta no EmailJS
        // e substituir 'YOUR_USER_ID' pelo seu ID de usuário real
        emailjs.init("YOUR_USER_ID");
    }

    // Tenta inicializar o EmailJS se o script estiver carregado
    if (typeof emailjs !== 'undefined') {
        setupEmailService();
    }

    // Validação do formulário de agendamento
    const agendamentoForm = document.getElementById('agendamento-form');

    if (agendamentoForm) {
        // Adiciona validação em tempo real para os campos, mas não impede o envio nativo do formulário
        const nome = document.getElementById('nome');
        const telefone = document.getElementById('telefone');
        const email = document.getElementById('email');
        const tipoVistoria = document.getElementById('tipo-vistoria');
        const data = document.getElementById('data');
        const horario = document.getElementById('horario');

        // Validação em tempo real para nome
        nome.addEventListener('blur', function () {
            if (!this.value.trim()) {
                showError(this, 'Por favor, informe seu nome completo');
            } else {
                removeError(this);
            }
        });

        // Validação em tempo real para telefone
        telefone.addEventListener('blur', function () {
            if (!this.value.trim()) {
                showError(this, 'Por favor, informe seu telefone');
            } else {
                removeError(this);
            }
        });

        // Validação em tempo real para email
        email.addEventListener('blur', function () {
            if (!validateEmail(this.value)) {
                showError(this, 'Por favor, informe um e-mail válido');
            } else {
                removeError(this);
            }
        });

        // Validação em tempo real para tipo de vistoria
        tipoVistoria.addEventListener('change', function () {
            if (this.value === '') {
                showError(this, 'Por favor, selecione o tipo de vistoria');
            } else {
                removeError(this);
            }
        });

        // Validação em tempo real para data
        data.addEventListener('change', function () {
            if (!this.value) {
                showError(this, 'Por favor, selecione uma data');
            } else {
                removeError(this);
            }
        });

        // Validação em tempo real para horário
        horario.addEventListener('change', function () {
            if (!this.value) {
                showError(this, 'Por favor, selecione um horário');
            } else {
                removeError(this);
            }
        });

        // Não impedimos o envio nativo do formulário, pois o FormSubmit cuidará disso
    }

    // Interatividade do FAQ
    const accordionButtons = document.querySelectorAll('.accordion-button');

    if (accordionButtons.length > 0) {
        accordionButtons.forEach(button => {
            button.addEventListener('click', function () {
                // O Bootstrap já cuida da funcionalidade de expandir/recolher
                console.log('FAQ item clicado');
            });
        });
    }

    // Funcionalidade de download de documentos
    const downloadLinks = document.querySelectorAll('a[download]');

    if (downloadLinks.length > 0) {
        downloadLinks.forEach(link => {
            link.addEventListener('click', function (e) {
                const href = this.getAttribute('href');
                if (href.includes('docs/')) {
                    console.log('Download iniciado: ' + href);
                }
            });
        });
    }

    // Smooth scroll para links de navegação
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            if (this.getAttribute('href') !== '#' && !this.getAttribute('data-bs-toggle')) {
                e.preventDefault();

                const targetId = this.getAttribute('href');
                const targetElement = document.querySelector(targetId);

                if (targetElement) {
                    targetElement.scrollIntoView({
                        behavior: 'smooth'
                    });
                }
            }
        });
    });
});

// Funções auxiliares
function showError(input, message) {
    const formGroup = input.parentElement;
    const errorMessage = formGroup.querySelector('.invalid-feedback') || document.createElement('div');

    errorMessage.className = 'invalid-feedback';
    errorMessage.innerText = message;

    if (!formGroup.querySelector('.invalid-feedback')) {
        formGroup.appendChild(errorMessage);
    }

    input.classList.add('is-invalid');
}

function removeError(input) {
    input.classList.remove('is-invalid');
    const formGroup = input.parentElement;
    const errorMessage = formGroup.querySelector('.invalid-feedback');

    if (errorMessage) {
        formGroup.removeChild(errorMessage);
    }
}

function validateEmail(email) {
    const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
}

// Função mantida apenas para compatibilidade com o código existente
function sendEmail(formData) {
    console.log('Função sendEmail chamada, mas o envio será feito pelo FormSubmit');
    // Não fazemos nada aqui, pois o envio será feito pelo FormSubmit
}

// Adicionamos um listener para o evento de envio bem-sucedido do FormSubmit
// Isso é detectado quando o usuário retorna da página de agradecimento do FormSubmit
if (window.location.hash === '#agendamento' && window.location.search.includes('?sent=true')) {
    // Mostrar mensagem de sucesso
    window.addEventListener('DOMContentLoaded', function () {
        showSuccessMessage();
    });
}

function showSuccessMessage() {
    const alertContainer = document.getElementById('alert-container');

    if (alertContainer) {
        const alertDiv = document.createElement('div');
        alertDiv.className = 'alert alert-success alert-dismissible fade show';
        alertDiv.role = 'alert';
        alertDiv.innerHTML = `
            <strong>Agendamento realizado com sucesso!</strong> Em breve entraremos em contato para confirmar sua vistoria.
            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
        `;

        alertContainer.appendChild(alertDiv);

        // Auto-dismiss after 5 seconds
        setTimeout(() => {
            alertDiv.classList.remove('show');
            setTimeout(() => {
                alertContainer.removeChild(alertDiv);
            }, 300);
        }, 5000);
    }
}

function showErrorMessage() {
    const alertContainer = document.getElementById('alert-container');

    if (alertContainer) {
        const alertDiv = document.createElement('div');
        alertDiv.className = 'alert alert-danger alert-dismissible fade show';
        alertDiv.role = 'alert';
        alertDiv.innerHTML = `
            <strong>Erro ao enviar o agendamento!</strong> Por favor, tente novamente ou entre em contato por telefone.
            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
        `;

        alertContainer.appendChild(alertDiv);

        // Auto-dismiss after 5 seconds
        setTimeout(() => {
            alertDiv.classList.remove('show');
            setTimeout(() => {
                alertContainer.removeChild(alertDiv);
            }, 300);
        }, 5000);
    }
}
