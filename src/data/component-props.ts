export interface PropItem {
  name: string;
  type: string;
  default?: string;
  description: string;
  variants?: string[];
}

export const buttonProps: PropItem[] = [
  {
    name: 'variant',
    type: "'crimson' | 'cyan' | 'gold' | 'dark' | 'outline'",
    default: "'crimson'",
    description: 'Estilo cromático del botón según la paleta Scorch Neo-Brutalista.',
    variants: ['crimson', 'cyan', 'gold', 'dark', 'outline'],
  },
  {
    name: 'size',
    type: "'sm' | 'md' | 'lg'",
    default: "'md'",
    description: 'Tamaño físico y padding del botón.',
    variants: ['sm', 'md', 'lg'],
  },
  {
    name: 'href',
    type: 'string',
    default: 'undefined',
    description: 'Si se define, renderiza una etiqueta <a> con estilo de botón.',
  },
  {
    name: 'type',
    type: "'button' | 'submit' | 'reset'",
    default: "'button'",
    description: 'Tipo de botón HTML nativo.',
    variants: ['button', 'submit', 'reset'],
  },
  {
    name: 'disabled',
    type: 'boolean',
    default: 'false',
    description: 'Deshabilita la interacción, sonido táctil y atenúa la opacidad.',
  },
  {
    name: 'class',
    type: 'string',
    default: "''",
    description: 'Clases Tailwind adicionales añadidas al contenedor.',
  },
];

export const badgeProps: PropItem[] = [
  {
    name: 'variant',
    type: "'crimson' | 'cyan' | 'gold' | 'dark' | 'outline'",
    default: "'crimson'",
    description: 'Color de fondo y contraste de la etiqueta de estado.',
    variants: ['crimson', 'cyan', 'gold', 'dark', 'outline'],
  },
  {
    name: 'size',
    type: "'sm' | 'md'",
    default: "'sm'",
    description: 'Escala tipográfica y espaciado interior.',
    variants: ['sm', 'md'],
  },
  {
    name: 'class',
    type: 'string',
    default: "''",
    description: 'Clases utilitarias adicionales de Tailwind.',
  },
];

export const cardProps: PropItem[] = [
  {
    name: 'title',
    type: 'string',
    default: "'0xWINDOW // TUI'",
    description: 'Título visual mostrado en la barra superior de la ventana TUI.',
  },
  {
    name: 'status',
    type: 'string',
    default: "'ONLINE'",
    description: 'Texto de telemetría / estado en la esquina superior derecha.',
  },
  {
    name: 'class',
    type: 'string',
    default: "''",
    description: 'Clases CSS para personalizar el cuerpo interior.',
  },
];

export const progressProps: PropItem[] = [
  {
    name: 'value',
    type: 'number',
    default: '0',
    description: 'Porcentaje actual de la barra (rango 0 a 100).',
  },
  {
    name: 'label',
    type: 'string',
    default: 'undefined',
    description: 'Etiqueta de texto descriptiva en la parte superior.',
  },
  {
    name: 'status',
    type: 'string',
    default: "''",
    description: 'Texto de estado secundario alineado a la derecha.',
  },
  {
    name: 'variant',
    type: "'crimson' | 'cyan' | 'emerald'",
    default: "'crimson'",
    description: 'Variante de color de la barra de llenado acelerada por GPU.',
    variants: ['crimson', 'cyan', 'emerald'],
  },
  {
    name: 'showAscii',
    type: 'boolean',
    default: 'true',
    description: 'Muestra u oculta la representación en bloques ASCII [████░░░░].',
  },
];

export const avatarSkeletonProps: PropItem[] = [
  {
    name: 'initials',
    type: 'string',
    default: "'0xA'",
    description: 'Iniciales o código hexadecimal del operador (máx. 3 caracteres).',
  },
  {
    name: 'name',
    type: 'string',
    default: "'0xAlex // Root Architect'",
    description: 'Nombre completo o identificador del usuario.',
  },
  {
    name: 'role',
    type: 'string',
    default: "'SYS_ADMIN // LEVEL_99'",
    description: 'Cargo, rol o nivel de privilegios del operador.',
  },
  {
    name: 'status',
    type: "'online' | 'busy' | 'idle'",
    default: "'online'",
    description: 'Estado de conexión reflejado en el indicador circular.',
    variants: ['online', 'busy', 'idle'],
  },
  {
    name: 'variant',
    type: "'crimson' | 'cyan' | 'gold' | 'dark'",
    default: "'crimson'",
    description: 'Color temático del recuadro del avatar.',
    variants: ['crimson', 'cyan', 'gold', 'dark'],
  },
  {
    name: 'lines (Skeleton)',
    type: 'number',
    default: '3',
    description: 'Cantidad de líneas simuladas en el componente Skeleton.',
  },
];

export const inputProps: PropItem[] = [
  {
    name: 'label',
    type: 'string',
    default: 'undefined',
    description: 'Título o etiqueta descriptiva superior del campo.',
  },
  {
    name: 'placeholder',
    type: 'string',
    default: "''",
    description: 'Texto de sugerencia en estado vacío.',
  },
  {
    name: 'value',
    type: 'string',
    default: "''",
    description: 'Valor inicial del input.',
  },
  {
    name: 'prefix',
    type: 'string',
    default: "''",
    description: 'Prefijo visual de consola fija (ej. $, tcp://, https://).',
  },
  {
    name: 'hint',
    type: 'string',
    default: "''",
    description: 'Texto de ayuda o instrucción bajo el recuadro.',
  },
  {
    name: 'error',
    type: 'string',
    default: "''",
    description: 'Mensaje de error que tiñe el borde en carmesí de alerta.',
  },
  {
    name: 'disabled',
    type: 'boolean',
    default: 'false',
    description: 'Desactiva el input y bloquea la edición.',
  },
  {
    name: 'name',
    type: 'string',
    default: "''",
    description: 'Atributo name nativo para formularios.',
  },
];

export const selectSliderProps: PropItem[] = [
  {
    name: 'label (Select)',
    type: 'string',
    default: 'undefined',
    description: 'Etiqueta del menú desplegable estilizado.',
  },
  {
    name: 'prefix (Select)',
    type: 'string',
    default: "''",
    description: 'Prefijo estilo terminal antes del selector (ej. ENGINE //).',
  },
  {
    name: 'options (Select)',
    type: '{ value: string; label: string }[]',
    default: '[]',
    description: 'Lista de opciones seleccionables con valor y texto visible.',
  },
  {
    name: 'label (Slider)',
    type: 'string',
    default: 'undefined',
    description: 'Etiqueta del control deslizante ASCII.',
  },
  {
    name: 'min / max (Slider)',
    type: 'number',
    default: '0 / 100',
    description: 'Límites numéricos mínimo y máximo del rango.',
  },
  {
    name: 'value (Slider)',
    type: 'number',
    default: '64',
    description: 'Valor numérico inicial de la corredera.',
  },
  {
    name: 'unit (Slider)',
    type: 'string',
    default: "''",
    description: 'Unidad de medida visual mostrada (ej. %, MHz, px, ms).',
  },
  {
    name: 'variant (Slider)',
    type: "'crimson' | 'cyan' | 'gold'",
    default: "'crimson'",
    description: 'Color de la barra activa del slider.',
    variants: ['crimson', 'cyan', 'gold'],
  },
];

export const toggleProps: PropItem[] = [
  {
    name: 'label (Checkbox)',
    type: 'string',
    default: 'undefined',
    description: 'Texto principal de la casilla de verificación.',
  },
  {
    name: 'checked (Checkbox)',
    type: 'boolean',
    default: 'false',
    description: 'Estado de selección inicial.',
  },
  {
    name: 'description (Checkbox)',
    type: 'string',
    default: "''",
    description: 'Texto aclaratorio o subtítulo bajo la casilla.',
  },
  {
    name: 'label (Switch)',
    type: 'string',
    default: 'undefined',
    description: 'Etiqueta del interruptor binario ON/OFF.',
  },
  {
    name: 'checked (Switch)',
    type: 'boolean',
    default: 'false',
    description: 'Estado inicial del interruptor mecánico.',
  },
  {
    name: 'name',
    type: 'string',
    default: "''",
    description: 'Nombre del campo para envío en formulario HTML.',
  },
];

export const textareaRadioProps: PropItem[] = [
  {
    name: 'label (Textarea)',
    type: 'string',
    default: 'undefined',
    description: 'Etiqueta del área de texto multilínea.',
  },
  {
    name: 'rows (Textarea)',
    type: 'number',
    default: '4',
    description: 'Cantidad de líneas visibles por defecto.',
  },
  {
    name: 'maxLength (Textarea)',
    type: 'number',
    default: '512',
    description: 'Límite de caracteres con contador interactivo en vivo.',
  },
  {
    name: 'placeholder (Textarea)',
    type: 'string',
    default: "'// Ingresa payload...'",
    description: 'Texto de sugerencia en el área de texto.',
  },
  {
    name: 'label (RadioGroup)',
    type: 'string',
    default: 'undefined',
    description: 'Encabezado del grupo de opciones de selección única.',
  },
  {
    name: 'name (RadioGroup)',
    type: 'string',
    default: 'undefined',
    description: 'Nombre del grupo que vincula las opciones de radio.',
  },
  {
    name: 'options (RadioGroup)',
    type: '{ value: string; label: string; badge?: string }[]',
    default: '[]',
    description: 'Opciones disponibles con badge de estado opcional.',
  },
];

export const tabsProps: PropItem[] = [
  {
    name: 'title',
    type: 'string',
    default: "'0xTABS // MULTI_VIEW'",
    description: 'Texto identificador en la esquina superior de la ventana de pestañas.',
  },
  {
    name: 'tabs',
    type: 'TabItem[]',
    default: '[]',
    description: 'Array de pestañas con { id, label, content, badge?, code? } navegables por teclado (← / →).',
  },
];

export const accordionProps: PropItem[] = [
  {
    name: 'name',
    type: 'string',
    default: "scorch-acc-<random>",
    description: 'Nombre que agrupa los acordeones (HTML5 details name) para cierre mutuamente exclusivo.',
  },
  {
    name: 'items',
    type: 'AccordionItem[]',
    default: '[]',
    description: 'Array de acordeones con { title, content, badge?, open? }.',
  },
];

export const navPrimitivesProps: PropItem[] = [
  {
    name: 'items (Breadcrumb)',
    type: 'BreadcrumbItem[]',
    default: '[]',
    description: 'Segmentos de la ruta Unix con { label, href? }.',
  },
  {
    name: 'prefix (Breadcrumb)',
    type: 'string',
    default: "'~'",
    description: 'Prefijo inicial de ruta de sistema de archivos.',
  },
  {
    name: 'currentPage (Pagination)',
    type: 'number',
    default: '1',
    description: 'Número de página actualmente activa.',
  },
  {
    name: 'totalPages (Pagination)',
    type: 'number',
    default: '1',
    description: 'Cantidad total de páginas disponibles.',
  },
  {
    name: 'baseUrl (Pagination)',
    type: 'string',
    default: "'?page='",
    description: 'Prefijo de URL para los enlaces de paginación.',
  },
];

export const alertProps: PropItem[] = [
  {
    name: 'variant',
    type: "'crimson' | 'cyan' | 'gold' | 'dark'",
    default: "'crimson'",
    description: 'Severidad y color temático de la alerta de sistema.',
    variants: ['crimson', 'cyan', 'gold', 'dark'],
  },
  {
    name: 'title',
    type: 'string',
    default: 'undefined',
    description: 'Encabezado principal en mayúsculas estilo TUI.',
  },
  {
    name: 'dismissible',
    type: 'boolean',
    default: 'true',
    description: 'Si es true, muestra botón [ × ] para cerrar la alerta.',
  },
];

export const modalToastProps: PropItem[] = [
  {
    name: 'id (Modal)',
    type: 'string',
    default: 'undefined',
    description: 'ID único del elemento HTML <dialog> invocado con window.openModal(id).',
  },
  {
    name: 'title (Modal)',
    type: 'string',
    default: "'0xMODAL // SYSTEM'",
    description: 'Título en la barra superior de la ventana modal.',
  },
  {
    name: 'status (Modal)',
    type: 'string',
    default: "'OPEN'",
    description: 'Badge de telemetría en la esquina derecha del modal.',
  },
  {
    name: 'id (Popover)',
    type: 'string',
    default: 'undefined',
    description: 'ID del popover nativo HTML5 top-layer invocado con popovertarget.',
  },
  {
    name: 'triggerLabel (Popover)',
    type: 'string',
    default: "'ABRIR POPOVER'",
    description: 'Texto del botón detonador del popover.',
  },
  {
    name: 'window.showToast()',
    type: '(title, message, variant?, duration?) => void',
    default: 'global',
    description: 'API global de cliente para emitir notificaciones flotantes con sonido.',
    variants: ['crimson', 'cyan', 'gold', 'emerald'],
  },
];
