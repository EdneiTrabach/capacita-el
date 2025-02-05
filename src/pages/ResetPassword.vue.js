/// <reference types="../../node_modules/.vue-global-types/vue_3.5_false.d.ts" />
import { ref, onMounted } from 'vue';
import { supabase } from '../config/supabase';
import { useRouter, useRoute } from 'vue-router';
const router = useRouter();
const route = useRoute();
const password = ref('');
const confirmPassword = ref('');
const error = ref('');
const loading = ref(false);
const showPassword = ref(false);
const showConfirmPassword = ref(false);
const toast = ref({
    show: false,
    message: '',
    type: 'success'
});
const handleResetPassword = async () => {
    try {
        loading.value = true;
        error.value = '';
        if (password.value !== confirmPassword.value) {
            error.value = 'As senhas não conferem';
            return;
        }
        // Obter o token da URL
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const accessToken = hashParams.get('access_token');
        const type = hashParams.get('type');
        if (!accessToken || type !== 'recovery') {
            throw new Error('Link de recuperação inválido ou expirado');
        }
        // Use setSession first to set the access token
        const { data: { session }, error: sessionError } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: ''
        });
        if (sessionError)
            throw sessionError;
        // Then update the password
        const { data: { user }, error: updateError } = await supabase.auth.updateUser({
            password: password.value
        });
        if (updateError)
            throw updateError;
        if (user) {
            // Update the profiles table
            const { error: profileError } = await supabase
                .from('profiles')
                .update({
                updated_at: new Date().toISOString(),
                last_password_reset: new Date().toISOString()
            })
                .eq('id', user.id);
            if (profileError)
                throw profileError;
        }
        showToast('Senha alterada com sucesso!', 'success');
        // Fazer logout para garantir que o usuário não fique logado
        await supabase.auth.signOut();
        setTimeout(() => {
            router.push('/login');
        }, 2000);
    }
    catch (e) {
        console.error('Erro ao redefinir senha:', e);
        error.value = 'Erro ao redefinir senha. Por favor, solicite um novo link de recuperação.';
        showToast('Erro ao redefinir senha', 'error');
    }
    finally {
        loading.value = false;
    }
};
const handleCancel = () => {
    router.push('/login');
};
const showToast = (message, type) => {
    toast.value = {
        show: true,
        message,
        type
    };
    // Hide toast after 3 seconds
    setTimeout(() => {
        toast.value.show = false;
    }, 3000);
}; /* PartiallyEnd: #3632/scriptSetup.vue */
function __VLS_template() {
    const __VLS_ctx = {};
    let __VLS_components;
    let __VLS_directives;
    ['header', 'header', 'cancel-button', 'reset-button', 'reset-button', 'toast', 'toast', 'error', 'reset-card', 'header', 'toggle-password', 'icon-toggle',];
    // CSS variable injection 
    // CSS variable injection end 
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: ("reset-container") },
    });
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: ("reset-card") },
    });
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: ("header") },
    });
    __VLS_elementAsFunction(__VLS_intrinsicElements.img)({
        src: ("/icons/logo-itilh.svg"),
        alt: ("Logo ITILH"),
        ...{ class: ("logo") },
    });
    __VLS_elementAsFunction(__VLS_intrinsicElements.h1, __VLS_intrinsicElements.h1)({});
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
        type: ((__VLS_ctx.showPassword ? 'text' : 'password')),
        placeholder: ("Nova Senha"),
        ...{ class: (({ error: __VLS_ctx.error })) },
        required: (true),
    });
    (__VLS_ctx.password);
    __VLS_elementAsFunction(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
        ...{ onClick: (...[$event]) => {
                __VLS_ctx.showPassword = !__VLS_ctx.showPassword;
            } },
        type: ("button"),
        ...{ class: ("toggle-password") },
    });
    __VLS_elementAsFunction(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: ("toggle-password-icon") },
    });
    (__VLS_ctx.showConfirmPassword ? '👁️' : '👁️‍🗨️');
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
        type: ((__VLS_ctx.showConfirmPassword ? 'text' : 'password')),
        placeholder: ("Confirmar Senha"),
        ...{ class: (({ error: __VLS_ctx.error })) },
        required: (true),
    });
    (__VLS_ctx.confirmPassword);
    __VLS_elementAsFunction(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
        ...{ onClick: (...[$event]) => {
                __VLS_ctx.showConfirmPassword = !__VLS_ctx.showConfirmPassword;
            } },
        type: ("button"),
        ...{ class: ("toggle-password") },
    });
    __VLS_elementAsFunction(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: ("toggle-password-icon") },
    });
    (__VLS_ctx.showConfirmPassword ? '👁️' : '👁️‍🗨️');
    if (__VLS_ctx.error) {
        __VLS_elementAsFunction(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
            ...{ class: ("error-message") },
        });
        (__VLS_ctx.error);
    }
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: ("button-group") },
    });
    __VLS_elementAsFunction(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
        ...{ onClick: (__VLS_ctx.handleCancel) },
        type: ("button"),
        ...{ class: ("cancel-button") },
    });
    __VLS_elementAsFunction(__VLS_intrinsicElements.img)({
        src: ("/icons/fechar.svg"),
        alt: ("Cancelar"),
        ...{ class: ("icon-white") },
    });
    __VLS_elementAsFunction(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
        type: ("submit"),
        ...{ class: ("reset-button") },
        disabled: ((__VLS_ctx.loading)),
    });
    if (!__VLS_ctx.loading) {
        __VLS_elementAsFunction(__VLS_intrinsicElements.img)({
            src: ("/icons/save-fill.svg"),
            alt: ("Salvar"),
            ...{ class: ("icon-white") },
        });
    }
    else {
        __VLS_elementAsFunction(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
    }
    (__VLS_ctx.loading ? 'Alterando...' : 'Alterar Senha');
    if (__VLS_ctx.toast.show) {
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: ((['toast', __VLS_ctx.toast.type])) },
        });
        (__VLS_ctx.toast.message);
    }
    ['reset-container', 'reset-card', 'header', 'logo', 'reset-form', 'form-group', 'input-container', 'input-icon', 'error', 'toggle-password', 'toggle-password-icon', 'form-group', 'input-container', 'input-icon', 'error', 'toggle-password', 'toggle-password-icon', 'error-message', 'button-group', 'cancel-button', 'icon-white', 'reset-button', 'icon-white', 'toast',];
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
            password: password,
            confirmPassword: confirmPassword,
            error: error,
            loading: loading,
            showPassword: showPassword,
            showConfirmPassword: showConfirmPassword,
            toast: toast,
            handleResetPassword: handleResetPassword,
            handleCancel: handleCancel,
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
