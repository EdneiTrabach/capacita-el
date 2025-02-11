/// <reference types="../../node_modules/.vue-global-types/vue_3.5_false.d.ts" />
import { ref, onMounted, watch } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { supabase } from '@/config/supabase';
import { setorService } from '@/services/api';
import { ibgeService } from '@/services/ibgeService';
import { sanitizeHTML } from '@/utils/sanitize';
const router = useRouter();
const route = useRoute();
const isEditing = ref(false);
const formData = ref({
    nome: '',
    email: '',
    dataNascimento: '',
    telefone: '',
    documento: '',
    cidade: '',
    estado: '',
    setor: ''
});
const errors = ref({});
const setores = ref([]);
const novoSetor = ref('');
const showSetorModal = ref(false);
const toast = ref({
    show: false,
    message: '',
    type: 'success'
});
// No data/ref
const municipios = ref([]);
const loading = ref(false);
const maxDate = ref(new Date().toISOString().split('T')[0]);
onMounted(async () => {
    await loadSetores();
    // Define isEditing baseado na query da rota
    isEditing.value = route.query.edit === 'true';
    if (isEditing.value && route.params.id) {
        await loadUsuario(route.params.id);
    }
});
const estados = [
    { uf: 'AC', nome: 'Acre' },
    { uf: 'AL', nome: 'Alagoas' },
    { uf: 'AP', nome: 'Amapá' },
    { uf: 'AM', nome: 'Amazonas' },
    { uf: 'BA', nome: 'Bahia' },
    { uf: 'CE', nome: 'Ceará' },
    { uf: 'DF', nome: 'Distrito Federal' },
    { uf: 'ES', nome: 'Espírito Santo' },
    { uf: 'GO', nome: 'Goiás' },
    { uf: 'MA', nome: 'Maranhão' },
    { uf: 'MT', nome: 'Mato Grosso' },
    { uf: 'MS', nome: 'Mato Grosso do Sul' },
    { uf: 'MG', nome: 'Minas Gerais' },
    { uf: 'PA', nome: 'Pará' },
    { uf: 'PB', nome: 'Paraíba' },
    { uf: 'PR', nome: 'Paraná' },
    { uf: 'PE', nome: 'Pernambuco' },
    { uf: 'PI', nome: 'Piauí' },
    { uf: 'RJ', nome: 'Rio de Janeiro' },
    { uf: 'RN', nome: 'Rio Grande do Norte' },
    { uf: 'RS', nome: 'Rio Grande do Sul' },
    { uf: 'RO', nome: 'Rondônia' },
    { uf: 'RR', nome: 'Roraima' },
    { uf: 'SC', nome: 'Santa Catarina' },
    { uf: 'SP', nome: 'São Paulo' },
    { uf: 'SE', nome: 'Sergipe' },
    { uf: 'TO', nome: 'Tocantins' },
];
const loadSetores = async () => {
    try {
        setores.value = await setorService.listarSetores();
    }
    catch (error) {
        console.error('Erro ao carregar setores:', error);
        showToast('Erro ao carregar setores', 'error');
    }
};
const cadastrarNovoSetor = async () => {
    if (!novoSetor.value) {
        showToast('Digite o nome do setor', 'error');
        return;
    }
    try {
        // Verifica se já existe um setor com o mesmo nome
        const { data: setorExistente } = await supabase
            .from('setores')
            .select('id')
            .ilike('nome', novoSetor.value.trim())
            .single();
        if (setorExistente) {
            showToast('Já existe uma origem cadastrada com este nome', 'error');
            return;
        }
        const { data: { user }, } = await supabase.auth.getUser();
        if (!user)
            throw new Error('User not authenticated');
        const setorData = {
            nome: novoSetor.value.trim(),
            created_by: user.id,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        };
        // Cadastra o novo setor
        await setorService.cadastrarSetor(novoSetor.value);
        await loadSetores();
        showSetorModal.value = false;
        novoSetor.value = '';
        showToast('Origem cadastrada com sucesso', 'success');
    }
    catch (error) {
        console.error('Erro ao cadastrar origem:', error);
        showToast('Erro ao cadastrar nova origem', 'error');
    }
};
// Adicione o método para buscar municípios
const buscarMunicipios = async (uf) => {
    try {
        if (!uf) {
            municipios.value = [];
            formData.value.cidade = '';
            return;
        }
        municipios.value = await ibgeService.getMunicipios(uf);
        formData.value.cidade = '';
    }
    catch (error) {
        console.error('Erro ao buscar municípios:', error);
        showToast('Erro ao carregar municípios', 'error');
        municipios.value = [];
        formData.value.cidade = '';
    }
};
// Adicione tratamento de erro melhorado
watch(() => formData.value.estado, async (novoEstado) => {
    if (novoEstado) {
        loading.value = true; // Adicione um estado de loading
        try {
            await buscarMunicipios(novoEstado);
        }
        finally {
            loading.value = false;
        }
    }
    else {
        municipios.value = [];
        formData.value.cidade = '';
    }
});
// Adicione estas funções no script
const formatCPF = (cpf) => {
    // Remove tudo que não é número
    const cleaned = cpf.replace(/\D/g, '');
    // Aplica a máscara XXX.XXX.XXX-XX
    return cleaned.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
};
const isCPFValid = (cpf) => {
    // Remove caracteres não numéricos
    const strCPF = cpf.replace(/\D/g, '');
    if (strCPF.length !== 11)
        return false;
    // Verifica CPFs com dígitos iguais
    if (/^(\d)\1{10}$/.test(strCPF))
        return false;
    // Validação dos dígitos verificadores
    let sum = 0;
    let remainder;
    // Primeiro dígito verificador
    for (let i = 1; i <= 9; i++) {
        sum = sum + parseInt(strCPF.substring(i - 1, i)) * (11 - i);
    }
    remainder = (sum * 10) % 11;
    if (remainder === 10 || remainder === 11)
        remainder = 0;
    if (remainder !== parseInt(strCPF.substring(9, 10)))
        return false;
    // Segundo dígito verificador
    sum = 0;
    for (let i = 1; i <= 10; i++) {
        sum = sum + parseInt(strCPF.substring(i - 1, i)) * (12 - i);
    }
    remainder = (sum * 10) % 11;
    if (remainder === 10 || remainder === 11)
        remainder = 0;
    if (remainder !== parseInt(strCPF.substring(10, 11)))
        return false;
    return true;
};
// Adicione um watch para formatar o CPF enquanto digita
watch(() => formData.value.documento, (newValue) => {
    if (!newValue)
        return;
    // Remove tudo que não é número
    const justNumbers = newValue.replace(/\D/g, '');
    // Limita a 11 dígitos
    if (justNumbers.length > 11) {
        formData.value.documento = formatCPF(justNumbers.slice(0, 11));
        return;
    }
    // Formata o CPF
    formData.value.documento = formatCPF(justNumbers);
});
// Função de validação individual para cada campo
const validateField = (field, value) => {
    const errors = {};
    switch (field) {
        case 'nome':
            if (!value)
                errors.nome = 'Nome é obrigatório';
            break;
        case 'documento':
            if (value && !isCPFValid(value)) {
                errors.documento = 'CPF inválido';
            }
            break;
        case 'setor':
            if (!value)
                errors.setor = 'Origem é obrigatória';
            break;
        case 'dataNascimento':
            if (value) {
                const year = new Date(value).getFullYear();
                if (year < 1900 || year > new Date().getFullYear()) {
                    errors.dataNascimento = 'Data inválida. O ano deve estar entre 1900 e o ano atual.';
                }
            }
            break;
        case 'telefone':
            if (value && !validateTelefone(value)) {
                errors.telefone = 'Telefone inválido. Digite um número válido com DDD';
            }
            break;
        // Adicione mais casos conforme necessário
    }
    return errors;
};
// Watchers para cada campo
watch(() => formData.value.nome, (newValue) => {
    const fieldErrors = validateField('nome', newValue);
    errors.value = { ...errors.value, ...fieldErrors };
});
watch(() => formData.value.documento, (newValue) => {
    const fieldErrors = validateField('documento', newValue);
    errors.value = { ...errors.value, ...fieldErrors };
});
watch(() => formData.value.setor, (newValue) => {
    const fieldErrors = validateField('setor', newValue);
    errors.value = { ...errors.value, ...fieldErrors };
});
watch(() => formData.value.dataNascimento, (newValue) => {
    // Só valida se o campo tiver uma data completa
    if (newValue && newValue.length === 10) {
        validateDate();
    }
});
// Modifique a função validateForm para usar a mesma lógica
const validateForm = () => {
    errors.value = {};
    // Valida todos os campos obrigatórios
    const allErrors = {
        ...validateField('nome', formData.value.nome),
        ...validateField('documento', formData.value.documento),
        ...validateField('setor', formData.value.setor),
    };
    errors.value = allErrors;
    return Object.keys(allErrors).length === 0;
};
// Função para salvar/atualizar usuário
const handleSubmit = async () => {
    if (validateForm()) {
        try {
            const userData = {
                nome: formData.value.nome,
                email: formData.value.email || null,
                data_nascimento: formData.value.dataNascimento || null,
                telefone: formData.value.telefone || null,
                documento: formData.value.documento || null,
                cidade: formData.value.cidade || null,
                estado: formData.value.estado || null,
                setor: formData.value.setor,
                updated_at: new Date().toISOString()
            };
            if (isEditing.value) {
                const { error } = await supabase
                    .from('usuarios')
                    .update(userData)
                    .eq('id', route.params.id);
                if (error)
                    throw error;
                showToast('Usuário atualizado com sucesso!', 'success');
            }
            else {
                const { error } = await supabase
                    .from('usuarios')
                    .insert([{ ...userData, status: 'ativo' }]);
                if (error)
                    throw error;
                showToast('Usuário cadastrado com sucesso!', 'success');
            }
            setTimeout(() => {
                router.push('/lista-usuarios');
            }, 2000);
        }
        catch (err) { // Removida a tipagem :any
            console.error('Erro ao salvar usuário:', err);
            showToast(err.message || 'Erro ao salvar usuário', 'error');
        }
    }
};
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
// Função para lidar com o input do CPF
const handleCPFInput = (e) => {
    let value = e.target.value.replace(/\D/g, ''); // Remove tudo que não é número
    if (value.length <= 11) {
        // Formata conforme vai digitando
        value = value.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, function (regex, arg1, arg2, arg3, arg4) {
            return `${arg1}.${arg2}.${arg3}-${arg4}`;
        });
        formData.value.documento = value;
        // Valida apenas quando completar 11 dígitos
        if (value.replace(/\D/g, '').length === 11) {
            const isValid = isCPFValid(value);
            if (!isValid) {
                errors.value = { ...errors.value, documento: 'CPF inválido' };
            }
            else {
                const { documento, ...restErrors } = errors.value;
                errors.value = restErrors;
            }
        }
    }
};
// Função para validar CPF quando sair do campo
const validateCPFOnBlur = () => {
    if (!formData.value.documento) {
        return; // CPF não é obrigatório, então não valida se estiver vazio
    }
    const isValid = isCPFValid(formData.value.documento);
    if (!isValid) {
        errors.value = { ...errors.value, documento: 'CPF inválido' };
    }
    else {
        const { documento, ...restErrors } = errors.value;
        errors.value = restErrors;
    }
};
// Função de validação do CPF melhorada
const validateCPF = (cpf) => {
    const strCPF = cpf.replace(/\D/g, '');
    if (strCPF.length !== 11)
        return false;
    // Verifica CPFs com dígitos iguais
    if (/^(\d)\1{10}$/.test(strCPF))
        return false;
    let sum = 0;
    let remainder;
    // Primeiro dígito verificador
    for (let i = 1; i <= 9; i++) {
        sum += parseInt(strCPF.substring(i - 1, i)) * (11 - i);
    }
    remainder = (sum * 10) % 11;
    if (remainder === 10 || 11)
        remainder = 0;
    if (remainder !== parseInt(strCPF.substring(9, 10)))
        return false;
    // Segundo dígito verificador
    sum = 0;
    for (let i = 1; i <= 10; i++) {
        sum += parseInt(strCPF.substring(i - 1, i)) * (12 - i);
    }
    remainder = (sum * 10) % 11;
    if (remainder === 10 || 11)
        remainder = 0;
    if (remainder !== parseInt(strCPF.substring(10, 11)))
        return false;
    return true;
};
const validateDate = () => {
    const date = formData.value.dataNascimento;
    if (date) {
        // Só valida se a data estiver completa (YYYY-MM-DD)
        if (date.length === 10) {
            const selectedDate = new Date(date);
            const year = selectedDate.getFullYear();
            const month = selectedDate.getMonth() + 1; // getMonth() retorna 0-11
            const day = selectedDate.getDate();
            // Verifica se é uma data válida
            const isValidDate = selectedDate instanceof Date && !isNaN(selectedDate);
            // Recria a data para verificar se os dias batem (isso pega meses com dias inválidos)
            const testDate = new Date(year, month - 1, day);
            const isValidDayMonth = testDate.getMonth() === month - 1 && testDate.getDate() === day;
            if (!isValidDate || !isValidDayMonth) {
                errors.value = {
                    ...errors.value,
                    dataNascimento: 'Data inválida. Por favor, insira uma data válida.'
                };
                return;
            }
            // Verifica o intervalo de anos apenas se a data for válida
            if (year < 1900 || year > new Date().getFullYear()) {
                errors.value = {
                    ...errors.value,
                    dataNascimento: 'O ano deve estar entre 1900 e o ano atual.'
                };
                return;
            }
            // Remove o erro se a data for válida
            const { dataNascimento, ...restErrors } = errors.value;
            errors.value = restErrors;
        }
    }
};
// Função para formatar o telefone
const formatarTelefone = (event) => {
    // Remove tudo que não é número
    let valor = event.target.value.replace(/\D/g, '');
    // Limita a 11 dígitos
    if (valor.length > 11) {
        valor = valor.slice(0, 11);
    }
    // Aplica a máscara progressivamente
    if (valor.length > 0) {
        // Primeiro parêntese
        valor = '(' + valor;
        if (valor.length > 3) {
            // Fecha parêntese após DDD
            valor = valor.slice(0, 3) + ') ' + valor.slice(3);
        }
        if (valor.length > 9) {
            // Hífen antes dos últimos 4 dígitos
            if (valor.length > 13) {
                // Para números de celular (11 dígitos)
                valor = valor.slice(0, 10) + '-' + valor.slice(10);
            }
            else {
                // Para números fixos (10 dígitos)
                valor = valor.slice(0, 9) + '-' + valor.slice(9);
            }
        }
    }
    // Atualiza o valor no v-model
    formData.value.telefone = valor;
};
// Adicione também uma validação específica para telefone
const validateTelefone = (telefone) => {
    const numeros = telefone.replace(/\D/g, '');
    return numeros.length >= 10 && numeros.length <= 11;
};
onMounted(loadSetores); /* PartiallyEnd: #3632/scriptSetup.vue */
function __VLS_template() {
    const __VLS_ctx = {};
    let __VLS_components;
    let __VLS_directives;
    ['cadastro-header', 'error', 'btn-cancelar', 'btn-salvar', 'btn-cancelar', 'btn-salvar', 'cadastro-container', 'form-grid', 'form-actions', 'modal-content', 'modal-content', 'form-group', 'modal-content', 'modal-content', 'modal-content', 'modal-actions', 'btn-cancelar', 'btn-salvar', 'btn-cancelar', 'btn-salvar', 'modal-content', 'modal-actions', 'modal-actions', 'btn-add-setor', 'toast', 'toast', 'error',];
    // CSS variable injection 
    // CSS variable injection end 
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: ("cadastro-container") },
    });
    if (__VLS_ctx.toast.show) {
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: ((['toast', __VLS_ctx.toast.type])) },
        });
        (__VLS_ctx.toast.message);
    }
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: ("cadastro-card") },
    });
    __VLS_elementAsFunction(__VLS_intrinsicElements.header, __VLS_intrinsicElements.header)({
        ...{ class: ("cadastro-header") },
    });
    __VLS_elementAsFunction(__VLS_intrinsicElements.h1, __VLS_intrinsicElements.h1)({});
    (__VLS_ctx.isEditing ? 'Editar Aluno' : 'Cadastro de pessoas');
    __VLS_elementAsFunction(__VLS_intrinsicElements.form, __VLS_intrinsicElements.form)({
        ...{ onSubmit: (__VLS_ctx.handleSubmit) },
        ...{ class: ("cadastro-form") },
    });
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: ("form-grid") },
    });
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: ("form-group") },
    });
    __VLS_elementAsFunction(__VLS_intrinsicElements.label, __VLS_intrinsicElements.label)({});
    __VLS_elementAsFunction(__VLS_intrinsicElements.input)({
        ...{ onBlur: (...[$event]) => {
                __VLS_ctx.validateField('nome', __VLS_ctx.formData.nome);
            } },
        type: ("text"),
        value: ((__VLS_ctx.formData.nome)),
        ...{ class: (({ error: __VLS_ctx.errors.nome })) },
        placeholder: ("Digite o nome completo"),
    });
    if (__VLS_ctx.errors.nome) {
        __VLS_elementAsFunction(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
            ...{ class: ("error-message") },
        });
        (__VLS_ctx.errors.nome);
    }
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: ("form-group") },
    });
    __VLS_elementAsFunction(__VLS_intrinsicElements.label, __VLS_intrinsicElements.label)({});
    __VLS_elementAsFunction(__VLS_intrinsicElements.input)({
        type: ("email"),
        ...{ class: (({ error: __VLS_ctx.errors.email })) },
        placeholder: ("Digite o email"),
    });
    (__VLS_ctx.formData.email);
    if (__VLS_ctx.errors.email) {
        __VLS_elementAsFunction(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
            ...{ class: ("error-message") },
        });
        (__VLS_ctx.errors.email);
    }
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: ("form-group") },
    });
    __VLS_elementAsFunction(__VLS_intrinsicElements.label, __VLS_intrinsicElements.label)({});
    __VLS_elementAsFunction(__VLS_intrinsicElements.input)({
        ...{ onChange: (__VLS_ctx.validateDate) },
        type: ("date"),
        ...{ class: (({ error: __VLS_ctx.errors.dataNascimento })) },
        min: (('1900-01-01')),
        max: ((__VLS_ctx.maxDate)),
    });
    (__VLS_ctx.formData.dataNascimento);
    if (__VLS_ctx.errors.dataNascimento) {
        __VLS_elementAsFunction(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
            ...{ class: ("error-message") },
        });
        (__VLS_ctx.errors.dataNascimento);
    }
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: ("form-group") },
    });
    __VLS_elementAsFunction(__VLS_intrinsicElements.label, __VLS_intrinsicElements.label)({});
    __VLS_elementAsFunction(__VLS_intrinsicElements.input)({
        ...{ onInput: (__VLS_ctx.formatarTelefone) },
        ...{ onBlur: (...[$event]) => {
                __VLS_ctx.validateField('telefone', __VLS_ctx.formData.telefone);
            } },
        type: ("tel"),
        ...{ class: (({ error: __VLS_ctx.errors.telefone })) },
        placeholder: ("(00) 00000-0000"),
        maxlength: ("15"),
    });
    (__VLS_ctx.formData.telefone);
    if (__VLS_ctx.errors.telefone) {
        __VLS_elementAsFunction(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
            ...{ class: ("error-message") },
        });
        (__VLS_ctx.errors.telefone);
    }
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: ("form-group") },
    });
    __VLS_elementAsFunction(__VLS_intrinsicElements.label, __VLS_intrinsicElements.label)({});
    __VLS_elementAsFunction(__VLS_intrinsicElements.input)({
        ...{ onInput: (__VLS_ctx.handleCPFInput) },
        ...{ onBlur: (__VLS_ctx.validateCPFOnBlur) },
        type: ("text"),
        value: ((__VLS_ctx.formData.documento)),
        ...{ class: (({ error: __VLS_ctx.errors.documento })) },
        placeholder: ("000.000.000-00"),
        maxlength: ("14"),
    });
    if (__VLS_ctx.errors.documento) {
        __VLS_elementAsFunction(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
            ...{ class: ("error-message") },
        });
        (__VLS_ctx.errors.documento);
    }
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: ("form-group") },
    });
    __VLS_elementAsFunction(__VLS_intrinsicElements.label, __VLS_intrinsicElements.label)({});
    __VLS_elementAsFunction(__VLS_intrinsicElements.select, __VLS_intrinsicElements.select)({
        ...{ onChange: (...[$event]) => {
                __VLS_ctx.buscarMunicipios(__VLS_ctx.formData.estado);
            } },
        value: ((__VLS_ctx.formData.estado)),
        ...{ class: (({ error: __VLS_ctx.errors.estado })) },
    });
    __VLS_elementAsFunction(__VLS_intrinsicElements.option, __VLS_intrinsicElements.option)({
        value: (""),
    });
    for (const [estado] of __VLS_getVForSourceType((__VLS_ctx.estados))) {
        __VLS_elementAsFunction(__VLS_intrinsicElements.option, __VLS_intrinsicElements.option)({
            key: ((estado.uf)),
            value: ((estado.uf)),
        });
        (estado.nome);
    }
    if (__VLS_ctx.errors.estado) {
        __VLS_elementAsFunction(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
            ...{ class: ("error-message") },
        });
        (__VLS_ctx.errors.estado);
    }
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: ("form-group") },
    });
    __VLS_elementAsFunction(__VLS_intrinsicElements.label, __VLS_intrinsicElements.label)({});
    __VLS_elementAsFunction(__VLS_intrinsicElements.select, __VLS_intrinsicElements.select)({
        value: ((__VLS_ctx.formData.cidade)),
        ...{ class: (({ error: __VLS_ctx.errors.cidade })) },
        disabled: ((!__VLS_ctx.formData.estado || __VLS_ctx.loading)),
    });
    __VLS_elementAsFunction(__VLS_intrinsicElements.option, __VLS_intrinsicElements.option)({
        value: (""),
    });
    (__VLS_ctx.loading ? 'Carregando...' : 'Selecione uma cidade');
    for (const [municipio] of __VLS_getVForSourceType((__VLS_ctx.municipios))) {
        __VLS_elementAsFunction(__VLS_intrinsicElements.option, __VLS_intrinsicElements.option)({
            key: ((municipio.id)),
            value: ((municipio.nome)),
        });
        (municipio.nome);
    }
    if (__VLS_ctx.errors.cidade) {
        __VLS_elementAsFunction(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
            ...{ class: ("error-message") },
        });
        (__VLS_ctx.errors.cidade);
    }
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: ("form-group") },
    });
    __VLS_elementAsFunction(__VLS_intrinsicElements.label, __VLS_intrinsicElements.label)({});
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: ("setor-input-group") },
    });
    __VLS_elementAsFunction(__VLS_intrinsicElements.select, __VLS_intrinsicElements.select)({
        ...{ onBlur: (...[$event]) => {
                __VLS_ctx.validateField('setor', __VLS_ctx.formData.setor);
            } },
        value: ((__VLS_ctx.formData.setor)),
        ...{ class: (({ error: __VLS_ctx.errors.setor })) },
    });
    __VLS_elementAsFunction(__VLS_intrinsicElements.option, __VLS_intrinsicElements.option)({
        value: (""),
    });
    for (const [setor] of __VLS_getVForSourceType((__VLS_ctx.setores))) {
        __VLS_elementAsFunction(__VLS_intrinsicElements.option, __VLS_intrinsicElements.option)({
            key: ((setor.id)),
            value: ((setor.nome)),
        });
        (setor.nome);
    }
    __VLS_elementAsFunction(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
        ...{ onClick: (...[$event]) => {
                __VLS_ctx.showSetorModal = true;
            } },
        type: ("button"),
        ...{ class: ("btn-add-setor") },
    });
    if (__VLS_ctx.errors.setor) {
        __VLS_elementAsFunction(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
            ...{ class: ("error-message") },
        });
        (__VLS_ctx.errors.setor);
    }
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: ("form-actions") },
    });
    __VLS_elementAsFunction(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
        ...{ onClick: (...[$event]) => {
                __VLS_ctx.$router.push('/');
            } },
        type: ("button"),
        ...{ class: ("btn-cancelar") },
    });
    __VLS_elementAsFunction(__VLS_intrinsicElements.img)({
        src: ("/public/icons/fechar.svg"),
        alt: ("Cancelar"),
        ...{ class: ("icon") },
    });
    __VLS_elementAsFunction(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
        type: ("submit"),
        ...{ class: ("btn-salvar") },
    });
    __VLS_elementAsFunction(__VLS_intrinsicElements.img)({
        src: ("/public/icons/save-fill.svg"),
        alt: ("Salvar"),
        ...{ class: ("icon") },
    });
    (__VLS_ctx.isEditing ? 'Atualizar' : 'Salvar');
    if (__VLS_ctx.showSetorModal) {
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: ("modal-overlay") },
        });
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: ("modal-content") },
        });
        __VLS_elementAsFunction(__VLS_intrinsicElements.h3, __VLS_intrinsicElements.h3)({});
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: ("form-group") },
        });
        __VLS_elementAsFunction(__VLS_intrinsicElements.label, __VLS_intrinsicElements.label)({});
        __VLS_elementAsFunction(__VLS_intrinsicElements.input)({
            type: ("text"),
            value: ((__VLS_ctx.novoSetor)),
            placeholder: ("Digite o nome da nova origem"),
        });
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: ("modal-actions") },
        });
        __VLS_elementAsFunction(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
            ...{ onClick: (...[$event]) => {
                    if (!((__VLS_ctx.showSetorModal)))
                        return;
                    __VLS_ctx.showSetorModal = false;
                } },
            ...{ class: ("btn-cancelar") },
        });
        __VLS_elementAsFunction(__VLS_intrinsicElements.img)({
            src: ("/public/icons/fechar.svg"),
            alt: ("Cancelar"),
            ...{ class: ("icon") },
        });
        __VLS_elementAsFunction(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
            ...{ onClick: (__VLS_ctx.cadastrarNovoSetor) },
            ...{ class: ("btn-salvar") },
        });
        __VLS_elementAsFunction(__VLS_intrinsicElements.img)({
            src: ("/public/icons/save-fill.svg"),
            alt: ("Salvar"),
            ...{ class: ("icon") },
        });
    }
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: ("preview-data") },
    });
    __VLS_elementAsFunction(__VLS_intrinsicElements.h3, __VLS_intrinsicElements.h3)({});
    (__VLS_ctx.sanitizeHTML(__VLS_ctx.formData.nome));
    __VLS_elementAsFunction(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({});
    (__VLS_ctx.sanitizeHTML(__VLS_ctx.formData.email));
    __VLS_elementAsFunction(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({});
    (__VLS_ctx.sanitizeHTML(__VLS_ctx.formData.setor));
    if (__VLS_ctx.loading) {
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: ("loading-overlay") },
        });
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: ("loading-spinner") },
        });
    }
    ['cadastro-container', 'toast', 'cadastro-card', 'cadastro-header', 'cadastro-form', 'form-grid', 'form-group', 'error', 'error-message', 'form-group', 'error', 'error-message', 'form-group', 'error', 'error-message', 'form-group', 'error', 'error-message', 'form-group', 'error', 'error-message', 'form-group', 'error', 'error-message', 'form-group', 'error', 'error-message', 'form-group', 'setor-input-group', 'error', 'btn-add-setor', 'error-message', 'form-actions', 'btn-cancelar', 'icon', 'btn-salvar', 'icon', 'modal-overlay', 'modal-content', 'form-group', 'modal-actions', 'btn-cancelar', 'icon', 'btn-salvar', 'icon', 'preview-data', 'loading-overlay', 'loading-spinner',];
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
            sanitizeHTML: sanitizeHTML,
            isEditing: isEditing,
            formData: formData,
            errors: errors,
            setores: setores,
            novoSetor: novoSetor,
            showSetorModal: showSetorModal,
            toast: toast,
            municipios: municipios,
            loading: loading,
            maxDate: maxDate,
            estados: estados,
            cadastrarNovoSetor: cadastrarNovoSetor,
            buscarMunicipios: buscarMunicipios,
            validateField: validateField,
            handleSubmit: handleSubmit,
            handleCPFInput: handleCPFInput,
            validateCPFOnBlur: validateCPFOnBlur,
            validateDate: validateDate,
            formatarTelefone: formatarTelefone,
        };
    },
});
export default (await import('vue')).defineComponent({
    setup() {
        return {};
    },
});
; /* PartiallyEnd: #4569/main.vue */
