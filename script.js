document.addEventListener('DOMContentLoaded', function () {
    // Menu Mobile
    const menuToggle = document.getElementById('menu-toggle');
    const nav = document.getElementById('nav');

    menuToggle.addEventListener('click', function () {
        nav.classList.toggle('show');
    });

    // Fechar menu ao clicar em um link
    const navLinks = document.querySelectorAll('nav a');
    navLinks.forEach(link => {
        link.addEventListener('click', function () {
            nav.classList.remove('show');
        });
    });

    // Animação de scroll suave para links internos
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();

            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);

            if (targetElement) {
                window.scrollTo({
                    top: targetElement.offsetTop - 80,
                    behavior: 'smooth'
                });
            }
        });
    });

    // Efeito de aparecer elementos ao rolar
    const animateOnScroll = function () {
        const elements = document.querySelectorAll('.card, .sobre-content, .localizacao-content, .contato-form');

        elements.forEach(element => {
            const elementPosition = element.getBoundingClientRect().top;
            const windowHeight = window.innerHeight;

            if (elementPosition < windowHeight - 100) {
                element.style.opacity = '1';
                element.style.transform = 'translateY(0)';
            }
        });
    };

    // Configuração inicial para animação
    const cards = document.querySelectorAll('.card');
    const sobreContent = document.querySelector('.sobre-content');
    const localizacaoContent = document.querySelector('.localizacao-content');
    const contatoForm = document.querySelector('.contato-form');

    cards.forEach(card => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(30px)';
        card.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
    });

    if (sobreContent) {
        sobreContent.style.opacity = '0';
        sobreContent.style.transform = 'translateY(30px)';
        sobreContent.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
    }

    if (localizacaoContent) {
        localizacaoContent.style.opacity = '0';
        localizacaoContent.style.transform = 'translateY(30px)';
        localizacaoContent.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
    }

    if (contatoForm) {
        contatoForm.style.opacity = '0';
        contatoForm.style.transform = 'translateY(30px)';
        contatoForm.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
    }

    // Ativar animação ao carregar e ao rolar
    window.addEventListener('load', animateOnScroll);
    window.addEventListener('scroll', animateOnScroll);

    // Validação do formulário
    const form = document.querySelector('form');
    if (form) {
        form.addEventListener('submit', function (e) {
            const nome = form.querySelector('input[name="nome"]');
            const telefone = form.querySelector('input[name="telefone"]');
            const data = form.querySelector('input[name="data"]');
            const hora = form.querySelector('input[name="hora"]');

            if (!nome.value.trim()) {
                alert('Por favor, insira seu nome');
                e.preventDefault();
                return;
            }

            if (!telefone.value.trim()) {
                alert('Por favor, insira seu telefone');
                e.preventDefault();
                return;
            }

            if (!data.value) {
                alert('Por favor, selecione uma data');
                e.preventDefault();
                return;
            }

            if (!hora.value) {
                alert('Por favor, selecione um horário');
                e.preventDefault();
                return;
            }

            // Se tudo estiver válido, pode enviar
            alert('Agendamento enviado com sucesso! Entraremos em contato para confirmar.');
        });
    }

    // Atualizar o ano no copyright
    const yearElement = document.querySelector('.copyright p');
    if (yearElement) {
        const currentYear = new Date().getFullYear();
        yearElement.textContent = yearElement.textContent.replace('2025', currentYear);
    }
});