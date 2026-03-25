import React, { useState, useRef, useEffect } from 'react';
import { FaChevronDown, FaCheck } from 'react-icons/fa';

/**
 * CustomSelect Component
 * Un select desplegable reutilizable con estilos premium.
 * 
 * @param {Array} options - Arreglo de opciones { value, label }
 * @param {String|Number} value - Valor actual seleccionado
 * @param {Function} onChange - Callback al seleccionar una opción (value) => void
 * @param {String} placeholder - Texto por defecto si no hay selección
 * @param {String} className - Clases CSS adicionales para el contenedor
 * @param {Boolean} required - Si es requerido (usado solo visualmente o en lógica superior)
 * @param {Boolean} disabled - Si el select está deshabilitado
 */
export default function CustomSelect({
    options = [],
    value,
    onChange,
    placeholder = 'Seleccione una opción...',
    className = '',
    required = false,
    disabled = false
}) {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    // Obtener la etiqueta seleccionada
    const selectedOption = options.find(opt => opt.value === value);
    const displayLabel = selectedOption ? selectedOption.label : placeholder;

    // Cerrar al hacer click fuera
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen]);

    const handleSelect = (val) => {
        if (!disabled) {
            onChange(val);
            setIsOpen(false);
        }
    };

    return (
        <div className={`relative ${className}`} ref={dropdownRef}>
            {/* Botón Principal */}
            <button
                type="button"
                disabled={disabled}
                onClick={() => setIsOpen(!isOpen)}
                className={`
                    w-full flex items-center justify-between
                    px-4 py-3 bg-white border rounded-xl text-left shadow-sm
                    outline-none transition-all duration-200
                    ${disabled ? 'opacity-50 cursor-not-allowed bg-slate-50' : 'cursor-pointer hover:border-blue-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500'}
                    ${isOpen ? 'border-blue-500 ring-2 ring-blue-500/20' : 'border-slate-200'}
                `}
            >
                <span className={`block truncate ${!selectedOption && 'text-slate-400'} font-medium`}>
                    {displayLabel}
                </span>
                <FaChevronDown 
                    className={`text-slate-400 text-xs transition-transform duration-300 ${isOpen ? 'rotate-180 text-blue-500' : ''}`} 
                />
            </button>

            {/* Lista Desplegable */}
            {isOpen && (
                <div className="absolute z-50 w-full mt-2 bg-white border border-slate-100 rounded-xl shadow-lg shadow-slate-200/50 py-2 max-h-60 overflow-y-auto custom-scrollbar animate-in fade-in slide-in-from-top-2 duration-200 origin-top">
                    {options.length === 0 ? (
                        <div className="px-4 py-3 text-sm text-slate-500 text-center">
                            No hay opciones disponibles
                        </div>
                    ) : (
                        options.map((option, index) => {
                            const isSelected = option.value === value;
                            return (
                                <button
                                    key={`${option.value}-${index}`}
                                    type="button"
                                    onClick={() => handleSelect(option.value)}
                                    className={`
                                        w-full text-left px-4 py-2.5 text-sm font-medium transition-colors flex items-center justify-between
                                        ${isSelected 
                                            ? 'bg-blue-50 text-blue-700' 
                                            : 'text-slate-700 hover:bg-slate-50 hover:text-blue-600'
                                        }
                                    `}
                                >
                                    <span className="truncate">{option.label}</span>
                                    {isSelected && <FaCheck className="text-blue-600 text-xs shrink-0" />}
                                </button>
                            );
                        })
                    )}
                </div>
            )}
            
            {/* Campo oculto para requerimientos de forms nativos si fuera necesario */}
            {required && !value && (
                <input
                    tabIndex={-1}
                    autoComplete="off"
                    style={{ opacity: 0, height: 0, position: 'absolute' }}
                    value={value || ''}
                    required={required}
                    onChange={() => {}}
                />
            )}
        </div>
    );
}
