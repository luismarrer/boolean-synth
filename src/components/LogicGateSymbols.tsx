

interface SymbolProps {
    color?: string
    size?: number
    className?: string
}

export const AndGate = ({ color = 'currentColor', size = 48, className = '' }: SymbolProps) => (
    <svg width={size} height={size / 2} viewBox="0 0 40 20" className={className}>
        <path
            d="M 5 0 L 20 0 A 10 10 0 0 1 20 20 L 5 20 Z"
            fill="none"
            stroke={color}
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
        />
    </svg>
)

export const OrGate = ({ color = 'currentColor', size = 48, className = '' }: SymbolProps) => (
    <svg width={size} height={size / 2} viewBox="0 0 40 20" className={className}>
        <path
            d="M 5 0 C 12 0 18 3 25 10 C 18 17 12 20 5 20 C 10 15 10 5 5 0 Z"
            fill="none"
            stroke={color}
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
        />
    </svg>
)

export const NotGate = ({ color = 'currentColor', size = 48, className = '' }: SymbolProps) => (
    <svg width={size} height={size / 2} viewBox="0 0 40 20" className={className}>
        <path
            d="M 10 2 L 25 10 L 10 18 Z"
            fill="none"
            stroke={color}
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
        />
        <circle
            cx="28"
            cy="10"
            r="2.5"
            fill="none"
            stroke={color}
            strokeWidth="1.5"
        />
    </svg>
)

export const XorGate = ({ color = 'currentColor', size = 48, className = '' }: SymbolProps) => (
    <svg width={size} height={size / 2} viewBox="0 0 40 20" className={className}>
        <path
            d="M 2 0 C 7 5 7 15 2 20"
            fill="none"
            stroke={color}
            strokeWidth="1.5"
            strokeLinecap="round"
        />
        <path
            d="M 6 0 C 13 0 19 3 26 10 C 19 17 13 20 6 20 C 11 15 11 5 6 0 Z"
            fill="none"
            stroke={color}
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
        />
    </svg>
)

export const NandGate = ({ color = 'currentColor', size = 48, className = '' }: SymbolProps) => (
    <svg width={size} height={size / 2} viewBox="0 0 40 20" className={className}>
        <path
            d="M 5 0 L 20 0 A 10 10 0 0 1 20 20 L 5 20 Z"
            fill="none"
            stroke={color}
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
        />
        <circle
            cx="32.5"
            cy="10"
            r="2.5"
            fill="none"
            stroke={color}
            strokeWidth="1.5"
        />
    </svg>
)

export const NorGate = ({ color = 'currentColor', size = 48, className = '' }: SymbolProps) => (
    <svg width={size} height={size / 2} viewBox="0 0 40 20" className={className}>
        <path
            d="M 5 0 C 12 0 18 3 25 10 C 18 17 12 20 5 20 C 10 15 10 5 5 0 Z"
            fill="none"
            stroke={color}
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
        />
        <circle
            cx="30.5"
            cy="10"
            r="2.5"
            fill="none"
            stroke={color}
            strokeWidth="1.5"
        />
    </svg>
)

export const XnorGate = ({ color = 'currentColor', size = 48, className = '' }: SymbolProps) => (
    <svg width={size} height={size / 2} viewBox="0 0 40 20" className={className}>
        <path
            d="M 2 0 C 7 5 7 15 2 20"
            fill="none"
            stroke={color}
            strokeWidth="1.5"
            strokeLinecap="round"
        />
        <path
            d="M 6 0 C 13 0 19 3 26 10 C 19 17 13 20 6 20 C 11 15 11 5 6 0 Z"
            fill="none"
            stroke={color}
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
        />
        <circle
            cx="31.5"
            cy="10"
            r="2.5"
            fill="none"
            stroke={color}
            strokeWidth="1.5"
        />
    </svg>
)
