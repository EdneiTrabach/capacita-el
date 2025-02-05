/// <reference types="../../node_modules/.vue-global-types/vue_3.5_false.d.ts" />
import { ref, onMounted } from 'vue';
import { supabase } from '../config/supabase';
import { useRouter } from 'vue-router';
const router = useRouter();
const email = ref('');
const password = ref('');
const error = ref('');
const showMatrix = ref(false);
const loading = ref(false);
const handleLogoClick = () => {
    showMatrix.value = !showMatrix.value;
};
const generateRandomChars = () => {
    return Array(20).fill(0)
        .map(() => String.fromCharCode(33 + Math.floor(Math.random() * 94)))
        .join('');
};
const handleLogin = async () => {
    try {
        const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
            email: email.value,
            password: password.value,
        });
        if (authError)
            throw authError;
        // Check if user has access
        const { data: profileData, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', authData.user.id)
            .single();
        if (profileError || !profileData) {
            await supabase.auth.signOut();
            throw new Error('Usuário não autorizado');
        }
        // Redirect to home page
        router.push('/');
    }
    catch (e) {
        console.error('Login error:', e);
        error.value = 'Erro ao fazer login. Verifique suas credenciais ou contate o administrador.';
    }
};
// Updated registration function
const handleRegister = async () => {
    try {
        const { data: authData, error: authError } = await supabase.auth.signUp({
            email: email.value,
            password: password.value,
        });
        if (authError)
            throw authError;
        // Profile will be created automatically by the database trigger
        // Show success message
        alert('Registro realizado com sucesso! Verifique seu email para confirmar a conta.');
    }
    catch (e) {
        console.error('Registration error:', e);
        error.value = 'Erro ao registrar usuário. Tente novamente.';
    }
};
const showForgotModal = ref(false);
const resetEmail = ref('');
const toast = ref({
    show: false,
    message: '',
    type: 'success'
});
// Função para mostrar mensagem toast
const showToast = (message, type = 'success') => {
    toast.value = {
        show: true,
        message,
        type
    };
    setTimeout(() => {
        toast.value.show = false;
    }, 3000);
};
// Modifique o link para abrir o modal
const handleForgotClick = (e) => {
    e.preventDefault();
    showForgotModal.value = true;
};
// Função de recuperação de senha atualizada
const handleResetPassword = async () => {
    try {
        loading.value = true;
        const { error } = await supabase.auth.resetPasswordForEmail(resetEmail.value, {
            redirectTo: import.meta.env.VITE_SUPABASE_REDIRECT_URL
        });
        if (error)
            throw error;
        showForgotModal.value = false;
        showToast('Email de recuperação enviado com sucesso!', 'success');
    }
    catch (err) {
        const error = err;
        showToast('Erro ao enviar email: ' + error.message, 'error');
    }
    finally {
        loading.value = false;
    }
};
function __VLS_template() {
    const __VLS_ctx = {};
    let __VLS_components;
    let __VLS_directives;
    ['login-container', 'login-container', 'login-card', 'login-button', 'logo-container', 'forgot-link', 'login-card', 'matrix-container', 'btn-cancelar', 'btn-enviar', 'btn-enviar', 'toast', 'toast', 'error', 'modal-overlay', 'modal-content', 'modal-content', 'form-group', 'input-container', 'input-icon', 'modal-actions', 'btn-cancelar', 'btn-enviar', 'btn-cancelar', 'btn-enviar', 'btn-cancelar', 'btn-enviar', 'btn-cancelar', 'btn-enviar', 'modal-content', 'modal-actions', 'btn-cancelar', 'btn-enviar',];
    // CSS variable injection 
    // CSS variable injection end 
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: ("login-container") },
    });
    if (__VLS_ctx.toast.show) {
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: ((['toast', __VLS_ctx.toast.type])) },
        });
        (__VLS_ctx.toast.message);
    }
    if (__VLS_ctx.showMatrix) {
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: ("matrix-effect") },
        });
        for (const [i] of __VLS_getVForSourceType((50))) {
            __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                key: ((i)),
                ...{ class: ("matrix-column") },
                ...{ style: (({
                        left: `${Math.random() * 100}%`,
                        animationDuration: `${2 + Math.random() * 3}s`,
                        animationDelay: `${Math.random() * 2}s`
                    })) },
            });
            (__VLS_ctx.generateRandomChars());
        }
    }
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: ("login-card") },
    });
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: ("logo-container") },
    });
    __VLS_elementAsFunction(__VLS_intrinsicElements.img)({
        src: ("/public/icons/logo-itilh.svg"),
        alt: ("Logo Itilh"),
        ...{ class: ("logo") },
    });
    __VLS_elementAsFunction(__VLS_intrinsicElements.h1, __VLS_intrinsicElements.h1)({});
    __VLS_elementAsFunction(__VLS_intrinsicElements.form, __VLS_intrinsicElements.form)({
        ...{ onSubmit: (__VLS_ctx.handleLogin) },
        ...{ class: ("login-form") },
    });
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: ("form-group") },
    });
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: ("input-container") },
    });
    __VLS_elementAsFunction(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: ("input-icon") },
    });
    __VLS_elementAsFunction(__VLS_intrinsicElements.input)({
        type: ("text"),
        value: ((__VLS_ctx.email)),
        placeholder: (" "),
        ...{ class: (({ error: __VLS_ctx.error })) },
    });
    __VLS_elementAsFunction(__VLS_intrinsicElements.label, __VLS_intrinsicElements.label)({});
    if (__VLS_ctx.error) {
        __VLS_elementAsFunction(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
            ...{ class: ("error-message") },
        });
        (__VLS_ctx.error);
    }
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: ("form-group") },
    });
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: ("input-container") },
    });
    __VLS_elementAsFunction(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: ("input-icon") },
    });
    __VLS_elementAsFunction(__VLS_intrinsicElements.input)({
        type: ("password"),
        placeholder: (" "),
        ...{ class: (({ error: __VLS_ctx.error })) },
    });
    (__VLS_ctx.password);
    __VLS_elementAsFunction(__VLS_intrinsicElements.label, __VLS_intrinsicElements.label)({});
    if (__VLS_ctx.error) {
        __VLS_elementAsFunction(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
            ...{ class: ("error-message") },
        });
        (__VLS_ctx.error);
    }
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: ("forgot-password") },
    });
    __VLS_elementAsFunction(__VLS_intrinsicElements.a, __VLS_intrinsicElements.a)({
        ...{ onClick: (__VLS_ctx.handleForgotClick) },
        href: ("#"),
        ...{ class: ("forgot-link") },
    });
    __VLS_elementAsFunction(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
        type: ("submit"),
        ...{ class: ("login-button") },
    });
    if (__VLS_ctx.showForgotModal) {
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: ("modal-overlay") },
        });
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: ("modal-content") },
        });
        __VLS_elementAsFunction(__VLS_intrinsicElements.h2, __VLS_intrinsicElements.h2)({});
        __VLS_elementAsFunction(__VLS_intrinsicElements.form, __VLS_intrinsicElements.form)({
            ...{ onSubmit: (__VLS_ctx.handleResetPassword) },
            ...{ class: ("reset-form") },
        });
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: ("form-group") },
        });
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: ("input-container") },
        });
        __VLS_elementAsFunction(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
            ...{ class: ("input-icon") },
        });
        __VLS_elementAsFunction(__VLS_intrinsicElements.input)({
            type: ("email"),
            placeholder: (" "),
            required: (true),
        });
        (__VLS_ctx.resetEmail);
        __VLS_elementAsFunction(__VLS_intrinsicElements.label, __VLS_intrinsicElements.label)({});
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: ("modal-actions") },
        });
        __VLS_elementAsFunction(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
            ...{ onClick: (...[$event]) => {
                    if (!((__VLS_ctx.showForgotModal)))
                        return;
                    __VLS_ctx.showForgotModal = false;
                } },
            type: ("button"),
            ...{ class: ("btn-cancelar") },
        });
        __VLS_elementAsFunction(__VLS_intrinsicElements.img)({
            src: ("/public/icons/fechar.svg"),
            alt: ("Cancelar"),
            ...{ class: ("icon-black") },
        });
        __VLS_elementAsFunction(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
            type: ("submit"),
            ...{ class: ("btn-enviar") },
            disabled: ((__VLS_ctx.loading)),
        });
        if (!__VLS_ctx.loading) {
            __VLS_elementAsFunction(__VLS_intrinsicElements.img)({
                src: ("/public/icons/save-fill.svg"),
                alt: ("Enviar"),
                ...{ class: ("icon-black") },
            });
        }
        else {
            __VLS_elementAsFunction(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
        }
        (__VLS_ctx.loading ? 'Enviando...' : 'Enviar');
    }
    ['login-container', 'toast', 'matrix-effect', 'matrix-column', 'login-card', 'logo-container', 'logo', 'login-form', 'form-group', 'input-container', 'input-icon', 'error', 'error-message', 'form-group', 'input-container', 'input-icon', 'error', 'error-message', 'forgot-password', 'forgot-link', 'login-button', 'modal-overlay', 'modal-content', 'reset-form', 'form-group', 'input-container', 'input-icon', 'modal-actions', 'btn-cancelar', 'icon-black', 'btn-enviar', 'icon-black',];
    var __VLS_slots;
    var $slots;
    let __VLS_inheritedAttrs;
    var $attrs;
    const __VLS_refs = {};
    var $refs;
    var $el;
    return {
        attrs: {},
        slots: __VLS_slots,
        refs: $refs,
        rootEl: $el,
    };
}
;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            email: email,
            password: password,
            error: error,
            showMatrix: showMatrix,
            loading: loading,
            generateRandomChars: generateRandomChars,
            handleLogin: handleLogin,
            showForgotModal: showForgotModal,
            resetEmail: resetEmail,
            toast: toast,
            handleForgotClick: handleForgotClick,
            handleResetPassword: handleResetPassword,
        };
    },
});
export default (await import('vue')).defineComponent({
    setup() {
        return {};
    },
    __typeEl: {},
});
; /* PartiallyEnd: #4569/main.vue */
