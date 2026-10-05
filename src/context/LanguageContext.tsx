import React, { createContext, useContext, useState, ReactNode } from 'react';

export type Language = 'es' | 'en' | 'pt';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string, defaultText?: string) => string;
}

const translations: Record<Language, Record<string, string>> = {
  es: {
    // Navigation / Tabs
    'nav.dashboard': 'Panel Ejecutivo',
    'nav.general': 'Datos & Tarifas',
    'nav.receipts': 'Recibos vs Censo',
    'nav.equipment': 'Censo de Cargas',
    'nav.circuits': 'Tableros & CNE',
    'nav.wiring': 'Cableado & Llaves',
    'nav.grounding': 'Puesta a Tierra',
    'nav.powerfactor': 'Factor Potencia',
    'nav.lighting': 'Iluminación RNE',
    'nav.solar': 'Solar Fotovoltaica',
    'nav.opportunities': 'Plan de Ahorro',
    'nav.bom': 'Lista Materiales',
    'nav.photos': 'Evidencia Fotos',
    'nav.report': 'Informe Oficial CIP',
    'nav.saved_projects': 'Trabajos Realizados',
    'nav.master_registry': 'Módulo Maestro CIP',

    // Header actions
    'header.clean_workspace': 'Limpiar Plataforma',
    'header.clean_confirm_title': '¿Limpiar toda la plataforma web?',
    'header.clean_confirm_desc': 'Se restablecerán todos los datos cargados para iniciar un nuevo proyecto en blanco. Recuerde que puede guardar el proyecto actual en "Trabajos Realizados" antes de limpiar.',
    'header.confirm': 'Sí, Limpiar Todo',
    'header.cancel': 'Cancelar',
    'header.new_project': 'Nuevo Proyecto',
    'header.excel': 'Excel',
    'header.report_btn': 'Informe CIP',
    'header.logout': 'Cerrar Sesión',
    'header.plan_standard': 'Plan Estándar (S/ 20)',
    'header.plan_premium': 'Plan Premium (S/ 50)',
    'header.upgrade': 'Mejorar',
    'header.edit_cip': 'Editar CIP',
    'header.profile_credentials': 'Credenciales Profesionales CIP',
    'header.save_credentials': 'Guardar Credenciales',
    'header.cip_input_only': 'Solo el número de CIP es modificable; nombre, consejo y especialidad se consultan y blindan automáticamente.',

    // Dashboard
    'dash.title': 'Panel de Control Ejecutivo & Peritaje Eléctrico',
    'dash.subtitle': 'Monitoreo normativo CNE, balance de potencia, eficiencia energética y seguridad eléctrica',
    'dash.installed_power': 'Potencia Instalada',
    'dash.max_demand': 'Máxima Demanda',
    'dash.monthly_kwh': 'Consumo Mensual',
    'dash.monthly_cost': 'Costo Mensual Estimado',
    'dash.safety_index': 'Índice de Seguridad CNE',
    'dash.efficiency_index': 'Índice de Eficiencia',
    'dash.annual_savings': 'Ahorro Potencial Anual',
    'dash.clean_btn': 'Limpiar Plataforma para Nuevo Proyecto',
    'dash.clean_banner_title': 'Espacio de Trabajo & Gestión de Proyectos',
    'dash.clean_banner_desc': 'Inicie un peritaje desde cero o limpie los datos previamente guardados en la plataforma con un solo clic.',
    'dash.clean_banner_action': 'Limpiar Plataforma Ahora',
    'dash.saved_badge': 'Máx. 2 trabajos guardados',
    'dash.facility_label': 'Instalación Activa',
    'dash.cne_compliance': 'Cumplimiento CNE',
    'dash.power_factor': 'Factor Potencia',
    'dash.view_cip_report': 'Ver Dictamen CIP',
    'dash.monthly_savings': 'ahorro mensual promedio',
    'dash.top_consumers': 'Top 5 Equipos Mayor Consumo',
    'dash.receipts_vs_census': 'Consumo Facturado vs Censo Eléctrico',
    'dash.consumption_by_use': 'Distribución Energética por Usos',
    'dash.critical_compliance': 'Puntos Críticos de Cumplimiento Normativo CNE',
    'dash.grounding_adequate': 'Sistema de Puesta a Tierra en Rango CNE',
    'dash.circuits_adequate': 'Conductores y Termomagnéticos según CNE',

    // Saved projects
    'saved.title': 'Trabajos Realizados & Historial de Peritajes',
    'saved.subtitle': 'Almacene hasta 2 proyectos completos con sus respectivos informes técnicos e indicadores normativos CNE.',
    'saved.slots_used': 'Proyectos guardados',
    'saved.save_current': 'Guardar Proyecto Actual',
    'saved.empty_slot': 'Espacio disponible para guardar trabajo',
    'saved.empty_desc': 'Puede guardar el proyecto que se encuentra actualmente en edición en la plataforma.',
    'saved.load': 'Cargar en Plataforma',
    'saved.view_report': 'Ver Informe Técnico',
    'saved.delete': 'Eliminar Trabajo',
    'saved.limit_reached': 'Límite de 2 proyectos alcanzado. Elimine uno para guardar uno nuevo.',
    'saved.saved_success': '¡Proyecto guardado con éxito en Trabajos Realizados!',
    'saved.loaded_success': '¡Proyecto cargado exitosamente en el área de trabajo activa!',
    'saved.deleted_success': 'Trabajo eliminado. Espacio liberado.',

    // Plans / Subscriptions
    'plan.modal_title': 'Planes de Suscripción E-DIAGNOSIS OS',
    'plan.modal_subtitle': 'Elija el plan y la cantidad de meses (1 a 12 meses) con escala oficial de descuentos',
    'plan.standard_title': 'Plan Estándar',
    'plan.standard_price': 'S/ 20',
    'plan.standard_period': 'al mes',
    'plan.premium_title': 'Plan Premium',
    'plan.premium_price': 'S/ 50',
    'plan.premium_period': 'al mes',
    'plan.current_active': 'Plan Activo Actual',
    'plan.select_plan': 'Seleccionar Plan',
    'plan.activate_premium': 'Activar Plan Premium',
    'plan.activate_standard': 'Cambiar a Plan Estándar',
    'plan.premium_locked_title': 'Módulo Exclusivo del Plan Premium (S/ 50)',
    'plan.premium_locked_desc': 'Este módulo avanzado requiere la suscripción Premium para cálculos normativos avanzados, simulación de ahorro y peritaje certificado.',
    'plan.duration_label': 'Periodo de Suscripción (1 a 12 meses):',
    'plan.duration_desc': 'Aumente o reduzca los meses con (+) y (-), o elija un acceso rápido:',
    'plan.months_count': 'meses',
    'plan.month_single': 'mes',
    'plan.discount_applied': 'Descuento por fidelidad aplicado',
    'plan.total_to_pay': 'Monto Total a Activar:',
    'plan.subtotal': 'Subtotal',
    'plan.checkout_title': 'Confirmación & Activación de Suscripción',
    'plan.checkout_subtitle': 'Verifique la cantidad de meses elegidos, el descuento y el monto final en soles:',
    'plan.months_to_contract': 'Meses contratados:',
    'plan.time_required': 'Tiempo de uso de la plataforma web:',
    'plan.btn_back': 'Volver a Comparar Planes',
    'plan.btn_confirm': 'Confirmar & Activar Ahora',
    'plan.success_title': '¡Suscripción Activada Exitosamente!',
    'plan.success_desc': 'Su cuenta cuenta ahora con acceso activo por los meses seleccionados.',

    // CIP & Validation
    'cip.search_title': 'Responsabilidad Técnica & Verificación Oficial CIP',
    'cip.search_desc': 'Ingrese el N° de CIP para consultar el padrón nacional del Colegio de Ingenieros del Perú.',
    'cip.input_label': 'Número de Registro CIP (Único campo editable):',
    'cip.placeholder': 'Ej. 278034',
    'cip.btn_search': 'Consultar Padrón CIP',
    'cip.status_verified': 'CIP Oficial Verificado & Habilitado',
    'cip.status_unverified': 'CIP No Encontrado en el Padrón Nacional',
    'cip.status_not_habilitado': 'CIP No Habilitado ante el Colegio de Ingenieros',
    'cip.engineer_name': 'Ingeniero Titular Colegiado (Automático):',
    'cip.council_label': 'Consejo Departamental CIP (Automático):',
    'cip.specialty_label': 'Especialidad Verdadera de Ingeniería (Automática):',
    'cip.condition_label': 'Condición de Habilitación Oficial:',
    'cip.locked_notice': 'Datos obtenidos del padrón oficial. Campos bloqueados para garantizar la integridad legal del peritaje (Ley N° 28858).',
    'cip.test_samples_title': 'Casos de prueba para validación rápida:',

    // Report
    'report.title': 'Informe Técnico Certificado CIP',
    'report.subtitle': 'Descarga oficial exclusiva en formato PDF y exportación en Excel (.xlsx)',
    'report.download_pdf': 'Descargar Informe PDF',
    'report.download_excel': 'Descargar Excel (.xlsx)',
    'report.print': 'Imprimir',
    'report.generating_pdf': 'Generando PDF...',
    'report.blocked_title': 'Emisión y Descarga de Informe Oficial CIP Bloqueada',
    'report.blocked_missing_desc': 'No se ha detectado un Número de Registro CIP válido o no fue encontrado en el padrón del Colegio de Ingenieros del Perú. Conforme a la Ley N° 28858 y el estatuto del CIP, es obligatorio registrar un CIP verificado para observar o descargar el informe.',
    'report.blocked_unhabilitated_desc': 'El colegiado figura con estado NO HABILITADO ante el Colegio de Ingenieros del Perú. Por disposición legal expresa, ningún profesional inhabilitado puede refrendar peritajes, emitir informes periciales ni descargar diagnósticos oficiales hasta regularizar su colegiatura.',
    'report.btn_resolve_cip': 'Editar y Validar CIP',

    // General & Common
    'common.active': 'Activo',
    'common.completed': 'Culminado',
    'common.in_progress': 'En Progreso',
    'common.client': 'Cliente / Razón Social',
    'common.engineer': 'Ingeniero Responsable',
    'common.date': 'Fecha',
    'common.status': 'Estado',
    'common.language': 'Idioma',
    'common.locked': 'Bloqueado por Integridad'
  },
  en: {
    // Navigation / Tabs
    'nav.dashboard': 'Executive Dashboard',
    'nav.general': 'Data & Tariffs',
    'nav.receipts': 'Bills vs Census',
    'nav.equipment': 'Equipment Survey',
    'nav.circuits': 'Panels & NEC Code',
    'nav.wiring': 'Wiring & Breakers',
    'nav.grounding': 'Grounding System',
    'nav.powerfactor': 'Power Factor',
    'nav.lighting': 'Lighting Study',
    'nav.solar': 'Solar Photovoltaic',
    'nav.opportunities': 'Savings Plan',
    'nav.bom': 'Bill of Materials',
    'nav.photos': 'Photo Evidence',
    'nav.report': 'Official CIP Report',
    'nav.saved_projects': 'Saved Projects',
    'nav.master_registry': 'Master CIP Module',

    // Header actions
    'header.clean_workspace': 'Clean Workspace',
    'header.clean_confirm_title': 'Clear the entire web platform?',
    'header.clean_confirm_desc': 'All current data will be reset to start a fresh blank project. Remember you can save your current project in "Saved Projects" before cleaning.',
    'header.confirm': 'Yes, Reset All',
    'header.cancel': 'Cancel',
    'header.new_project': 'New Project',
    'header.excel': 'Excel',
    'header.report_btn': 'CIP Report',
    'header.logout': 'Log Out',
    'header.plan_standard': 'Standard Plan (S/ 20)',
    'header.plan_premium': 'Premium Plan (S/ 50)',
    'header.upgrade': 'Upgrade',
    'header.edit_cip': 'Edit CIP',
    'header.profile_credentials': 'Professional CIP Credentials',
    'header.save_credentials': 'Save Credentials',
    'header.cip_input_only': 'Only the CIP number is editable; engineer name, council and specialty are auto-retrieved and locked.',

    // Dashboard
    'dash.title': 'Executive Dashboard & Electrical Audit',
    'dash.subtitle': 'Electrical safety, power balance, energy efficiency and regulatory compliance monitoring',
    'dash.installed_power': 'Installed Power',
    'dash.max_demand': 'Max Demand',
    'dash.monthly_kwh': 'Monthly Consumption',
    'dash.monthly_cost': 'Estimated Monthly Cost',
    'dash.safety_index': 'Safety Index',
    'dash.efficiency_index': 'Efficiency Score',
    'dash.annual_savings': 'Potential Annual Savings',
    'dash.clean_btn': 'Clean Platform for New Project',
    'dash.clean_banner_title': 'Workspace & Project Management',
    'dash.clean_banner_desc': 'Start an audit from scratch or clear previously saved data on the platform with one click.',
    'dash.clean_banner_action': 'Clean Platform Now',
    'dash.saved_badge': 'Max. 2 saved projects',
    'dash.facility_label': 'Active Facility',
    'dash.cne_compliance': 'CNE Compliance',
    'dash.power_factor': 'Power Factor',
    'dash.view_cip_report': 'View CIP Opinion',
    'dash.monthly_savings': 'average monthly savings',
    'dash.top_consumers': 'Top 5 Major Consumers',
    'dash.receipts_vs_census': 'Billed Utility vs Electrical Census',
    'dash.consumption_by_use': 'Energy Breakdown by End-Use',
    'dash.critical_compliance': 'Critical Regulatory Compliance Points',
    'dash.grounding_adequate': 'Grounding System within Range',
    'dash.circuits_adequate': 'Conductors & Breakers per Standards',

    // Saved projects
    'saved.title': 'Saved Projects & Audit History',
    'saved.subtitle': 'Store up to 2 complete projects with their technical reports and regulatory indicators.',
    'saved.slots_used': 'Saved projects',
    'saved.save_current': 'Save Current Project',
    'saved.empty_slot': 'Available slot to save work',
    'saved.empty_desc': 'You can save the project currently being edited into this slot.',
    'saved.load': 'Load into Workspace',
    'saved.view_report': 'View Technical Report',
    'saved.delete': 'Delete Project',
    'saved.limit_reached': '2-project limit reached. Delete one to save a new one.',
    'saved.saved_success': 'Project successfully saved into Saved Projects!',
    'saved.loaded_success': 'Project successfully loaded into active workspace!',
    'saved.deleted_success': 'Project deleted. Slot freed up.',

    // Plans / Subscriptions
    'plan.modal_title': 'E-DIAGNOSIS OS Subscription Plans',
    'plan.modal_subtitle': 'Choose your plan and subscription duration (1 to 12 months) with scaled discounts',
    'plan.standard_title': 'Standard Plan',
    'plan.standard_price': 'S/ 20',
    'plan.standard_period': 'per month',
    'plan.premium_title': 'Premium Plan',
    'plan.premium_price': 'S/ 50',
    'plan.premium_period': 'per month',
    'plan.current_active': 'Current Active Plan',
    'plan.select_plan': 'Select Plan',
    'plan.activate_premium': 'Activate Premium Plan',
    'plan.activate_standard': 'Switch to Standard Plan',
    'plan.premium_locked_title': 'Premium Exclusive Module (S/ 50)',
    'plan.premium_locked_desc': 'This advanced module requires the Premium subscription for advanced engineering calculations, solar simulation and certified audit reports.',
    'plan.duration_label': 'Subscription Duration (1 to 12 months):',
    'plan.duration_desc': 'Increase or decrease months with (+) and (-), or pick a quick shortcut:',
    'plan.months_count': 'months',
    'plan.month_single': 'month',
    'plan.discount_applied': 'Loyalty discount applied',
    'plan.total_to_pay': 'Total Amount to Activate:',
    'plan.subtotal': 'Subtotal',
    'plan.checkout_title': 'Subscription Confirmation & Checkout',
    'plan.checkout_subtitle': 'Review selected duration, applicable discounts, and total payment in Soles:',
    'plan.months_to_contract': 'Months contracted:',
    'plan.time_required': 'Web platform duration period:',
    'plan.btn_back': 'Back to Compare Plans',
    'plan.btn_confirm': 'Confirm & Activate Now',
    'plan.success_title': 'Subscription Activated Successfully!',
    'plan.success_desc': 'Your account is now updated with active access for the chosen months.',

    // CIP & Validation
    'cip.search_title': 'Technical Responsibility & Official CIP Verification',
    'cip.search_desc': 'Enter CIP number to query the National College of Engineers of Peru registry.',
    'cip.input_label': 'CIP Registration Number (Only editable field):',
    'cip.placeholder': 'E.g. 278034',
    'cip.btn_search': 'Query CIP Registry',
    'cip.status_verified': 'Official CIP Verified & Qualified',
    'cip.status_unverified': 'CIP Not Found in National Registry',
    'cip.status_not_habilitado': 'CIP Disqualified / Not Enabled at CIP',
    'cip.engineer_name': 'Registered Engineer Name (Automatic):',
    'cip.council_label': 'Regional Council CIP (Automatic):',
    'cip.specialty_label': 'True Engineering Specialty (Automatic):',
    'cip.condition_label': 'Official Qualification Status:',
    'cip.locked_notice': 'Data pulled directly from national registry. Fields are locked to preserve legal audit integrity.',
    'cip.test_samples_title': 'Quick test presets for validation:',

    // Report
    'report.title': 'Official CIP Certified Technical Report',
    'report.subtitle': 'Authorized downloads strictly in PDF format and Excel (.xlsx) data export',
    'report.download_pdf': 'Download PDF Report',
    'report.download_excel': 'Download Excel (.xlsx)',
    'report.print': 'Print',
    'report.generating_pdf': 'Generating PDF...',
    'report.blocked_title': 'CIP Official Report Viewing & Download Blocked',
    'report.blocked_missing_desc': 'No valid CIP registration number was entered or it was not found in the official registry. Under Peruvian Law No. 28858 and CIP bylaws, an authenticated CIP is required to view or download official audit reports.',
    'report.blocked_unhabilitated_desc': 'The registered engineer is currently marked as NOT QUALIFIED (No Habilitado) at the College of Engineers of Peru. By legal decree, unhabilitated professionals cannot sign, issue, or download official audit reports.',
    'report.btn_resolve_cip': 'Edit & Validate CIP',

    // General & Common
    'common.active': 'Active',
    'common.completed': 'Completed',
    'common.in_progress': 'In Progress',
    'common.client': 'Client / Company Name',
    'common.engineer': 'Responsible Engineer',
    'common.date': 'Date',
    'common.status': 'Status',
    'common.language': 'Language',
    'common.locked': 'Locked for Data Integrity'
  },
  pt: {
    // Navigation / Tabs
    'nav.dashboard': 'Painel Executivo',
    'nav.general': 'Dados & Tarifas',
    'nav.receipts': 'Faturas vs Censo',
    'nav.equipment': 'Censo de Cargas',
    'nav.circuits': 'Quadros & Código CNE',
    'nav.wiring': 'Cabeamento & Disjuntores',
    'nav.grounding': 'Aterramento (SPDA)',
    'nav.powerfactor': 'Fator de Potência',
    'nav.lighting': 'Estudo de Iluminação',
    'nav.solar': 'Solar Fotovoltaica',
    'nav.opportunities': 'Plano de Economia',
    'nav.bom': 'Lista de Materiais',
    'nav.photos': 'Evidências Fotográficas',
    'nav.report': 'Relatório Oficial CIP',
    'nav.saved_projects': 'Projetos Realizados',
    'nav.master_registry': 'Módulo Mestre CIP',

    // Header actions
    'header.clean_workspace': 'Limpar Plataforma',
    'header.clean_confirm_title': 'Limpar toda a plataforma web?',
    'header.clean_confirm_desc': 'Todos os dados carregados serão redefinidos para iniciar um novo projeto em branco. Lembre-se de salvar seu projeto atual em "Projetos Realizados" antes de limpar.',
    'header.confirm': 'Sim, Limpar Tudo',
    'header.cancel': 'Cancelar',
    'header.new_project': 'Novo Projeto',
    'header.excel': 'Excel',
    'header.report_btn': 'Relatório CIP',
    'header.logout': 'Encerrar Sessão',
    'header.plan_standard': 'Plano Padrão (S/ 20)',
    'header.plan_premium': 'Plano Premium (S/ 50)',
    'header.upgrade': 'Melhorar',
    'header.edit_cip': 'Editar CIP',
    'header.profile_credentials': 'Credenciais Profissionais CIP',
    'header.save_credentials': 'Salvar Credenciais',
    'header.cip_input_only': 'Apenas o número do CIP é editável; nome, conselho e especialidade são preenchidos e bloqueados automaticamente.',

    // Dashboard
    'dash.title': 'Painel de Controle Executivo & Auditoria Elétrica',
    'dash.subtitle': 'Monitoramento normativo CNE, balanço de potência, eficiência energética e segurança elétrica',
    'dash.installed_power': 'Potência Instalada',
    'dash.max_demand': 'Demanda Máxima',
    'dash.monthly_kwh': 'Consumo Mensual',
    'dash.monthly_cost': 'Custo Mensal Estimado',
    'dash.safety_index': 'Índice de Segurança CNE',
    'dash.efficiency_index': 'Índice de Eficiência',
    'dash.annual_savings': 'Economia Potencial Anual',
    'dash.clean_btn': 'Limpar Plataforma para Novo Projeto',
    'dash.clean_banner_title': 'Espaço de Trabalho & Gestão de Projetos',
    'dash.clean_banner_desc': 'Inicie uma perícia do zero ou limpe os dados salvos anteriormente na plataforma com um único clique.',
    'dash.clean_banner_action': 'Limpar Plataforma Agora',
    'dash.saved_badge': 'Máx. 2 projetos salvos',
    'dash.facility_label': 'Instalação Ativa',
    'dash.cne_compliance': 'Conformidade CNE',
    'dash.power_factor': 'Fator de Potência',
    'dash.view_cip_report': 'Ver Parecer CIP',
    'dash.monthly_savings': 'economia mensal média',
    'dash.top_consumers': 'Top 5 Maiores Consumidores',
    'dash.receipts_vs_census': 'Faturamento vs Censo Elétrico',
    'dash.consumption_by_use': 'Distribuição Energética por Usos',
    'dash.critical_compliance': 'Pontos Críticos de Conformidade Normativa',
    'dash.grounding_adequate': 'Sistema de Aterramento em Faixa Adequada',
    'dash.circuits_adequate': 'Condutores e Disjuntores segundo Normas',

    // Saved projects
    'saved.title': 'Projetos Realizados & Histórico de Auditorias',
    'saved.subtitle': 'Armazene até 2 projetos completos com seus respectivos relatórios técnicos e índices normativos.',
    'saved.slots_used': 'Projetos salvos',
    'saved.save_current': 'Salvar Projeto Atual',
    'saved.empty_slot': 'Espaço disponível para salvar trabalho',
    'saved.empty_desc': 'Você pode salvar o projeto em edição atual neste espaço.',
    'saved.load': 'Carregar na Plataforma',
    'saved.view_report': 'Ver Relatório Técnico',
    'saved.delete': 'Excluir Projeto',
    'saved.limit_reached': 'Limite de 2 projetos atingido. Exclua um para salvar outro.',
    'saved.saved_success': 'Projeto salvo com sucesso em Projetos Realizados!',
    'saved.loaded_success': 'Projeto carregado com sucesso no espaço de trabalho ativo!',
    'saved.deleted_success': 'Projeto excluído. Espaço liberado.',

    // Plans / Subscriptions
    'plan.modal_title': 'Planos de Assinatura E-DIAGNOSIS OS',
    'plan.modal_subtitle': 'Escolha o plano e a quantidade de meses (1 a 12 meses) com descontos progressivos',
    'plan.standard_title': 'Plano Padrão',
    'plan.standard_price': 'S/ 20',
    'plan.standard_period': 'ao mês',
    'plan.premium_title': 'Plano Premium',
    'plan.premium_price': 'S/ 50',
    'plan.premium_period': 'ao mês',
    'plan.current_active': 'Plano Ativo Atual',
    'plan.select_plan': 'Selecionar Plano',
    'plan.activate_premium': 'Ativar Plano Premium',
    'plan.activate_standard': 'Mudar para Plano Padrão',
    'plan.premium_locked_title': 'Módulo Exclusivo do Plano Premium (S/ 50)',
    'plan.premium_locked_desc': 'Este módulo avançado requer a assinatura Premium para cálculos normativos, simulação solar e relatórios periciais certificados.',
    'plan.duration_label': 'Período de Assinatura (1 a 12 meses):',
    'plan.duration_desc': 'Aumente ou diminua os meses com (+) e (-), ou use um atalho rápido:',
    'plan.months_count': 'meses',
    'plan.month_single': 'mês',
    'plan.discount_applied': 'Desconto por fidelidade aplicado',
    'plan.total_to_pay': 'Valor Total a Ativar:',
    'plan.subtotal': 'Subtotal',
    'plan.checkout_title': 'Confirmação & Ativação da Assinatura',
    'plan.checkout_subtitle': 'Confira a quantidade de meses escolhidos, descontos e o valor final em soles:',
    'plan.months_to_contract': 'Meses contratados:',
    'plan.time_required': 'Tempo de uso da plataforma web:',
    'plan.btn_back': 'Voltar aos Planos',
    'plan.btn_confirm': 'Confirmar & Ativar Agora',
    'plan.success_title': 'Assinatura Ativada com Sucesso!',
    'plan.success_desc': 'Sua conta agora tem acesso ativo para os meses selecionados.',

    // CIP & Validation
    'cip.search_title': 'Responsabilidade Técnica & Validação Oficial CIP',
    'cip.search_desc': 'Digite o N° do CIP para consultar o cadastro nacional do Colégio de Engenheiros do Peru.',
    'cip.input_label': 'Número de Registro CIP (Único campo editável):',
    'cip.placeholder': 'Ex. 278034',
    'cip.btn_search': 'Consultar Cadastro CIP',
    'cip.status_verified': 'CIP Oficial Verificado e Habilitado',
    'cip.status_unverified': 'CIP Não Encontrado no Cadastro Nacional',
    'cip.status_not_habilitado': 'CIP Não Habilitado no Colégio de Engenheiros',
    'cip.engineer_name': 'Engenheiro Titular Registrado (Automático):',
    'cip.council_label': 'Conselho Departamental CIP (Automático):',
    'cip.specialty_label': 'Especialidade Real de Engenharia (Automática):',
    'cip.condition_label': 'Condição de Habilitação Oficial:',
    'cip.locked_notice': 'Dados obtidos diretamente do registro oficial. Campos protegidos para garantir a integridade legal da perícia.',
    'cip.test_samples_title': 'Exemplos rápidos para teste:',

    // Report
    'report.title': 'Relatório Técnico Certificado CIP',
    'report.subtitle': 'Downloads autorizados exclusivamente em formato PDF e exportação em Excel (.xlsx)',
    'report.download_pdf': 'Baixar Relatório PDF',
    'report.download_excel': 'Baixar Excel (.xlsx)',
    'report.print': 'Imprimir',
    'report.generating_pdf': 'Gerando PDF...',
    'report.blocked_title': 'Visualização e Download do Relatório CIP Bloqueados',
    'report.blocked_missing_desc': 'Não foi inserido um número de CIP válido ou o número não foi encontrado no cadastro nacional do Colégio de Engenheiros do Peru. Conforme a lei, é obrigatório registrar um CIP válido para emitir relatórios periciais oficiais.',
    'report.blocked_unhabilitated_desc': 'O engenheiro está registrado como NÃO HABILITADO no Colégio de Engenheiros do Peru. Por exigência legal expressa, profissionais inabilitados não podem referendar perícias nem baixar diagnósticos oficiais.',
    'report.btn_resolve_cip': 'Editar e Validar CIP',

    // General & Common
    'common.active': 'Ativo',
    'common.completed': 'Concluído',
    'common.in_progress': 'Em Andamento',
    'common.client': 'Cliente / Razão Social',
    'common.engineer': 'Engenheiro Responsável',
    'common.date': 'Data',
    'common.status': 'Status',
    'common.language': 'Idioma',
    'common.locked': 'Bloqueado por Integridade'
  }
};

const LANGUAGE_STORAGE_KEY = 'e_diagnosis_language_preference';

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    try {
      const saved = localStorage.getItem(LANGUAGE_STORAGE_KEY);
      if (saved === 'es' || saved === 'en' || saved === 'pt') {
        return saved;
      }
    } catch (e) {
      console.error(e);
    }
    return 'es';
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    try {
      localStorage.setItem(LANGUAGE_STORAGE_KEY, lang);
    } catch (e) {
      console.error(e);
    }
  };

  const t = (key: string, defaultText?: string): string => {
    const dict = translations[language] || translations.es;
    return dict[key] || defaultText || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
