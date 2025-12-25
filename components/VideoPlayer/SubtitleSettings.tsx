'use client'

import React from 'react'
import { X, Type, Palette, Square, Eye, MoveVertical } from 'lucide-react'
import type { SubtitleStylePreferences } from '@/types/player'
import styles from './SubtitleSettings.module.css'

interface SubtitleSettingsProps {
    isOpen: boolean
    onClose: () => void
    currentStyles: SubtitleStylePreferences
    onStyleChange: (styles: Partial<SubtitleStylePreferences>) => void
    onReset: () => void
}

export default function SubtitleSettings({
    isOpen,
    onClose,
    currentStyles,
    onStyleChange,
    onReset
}: SubtitleSettingsProps) {
    if (!isOpen) return null

    return (
        <div className={styles.overlay} onClick={onClose}>
            <div className={styles.panel} onClick={(e) => e.stopPropagation()}>
                {/* Header */}
                <div className={styles.header}>
                    <h2 className={styles.title}>Subtitle Settings</h2>
                    <button onClick={onClose} className={styles.closeButton} aria-label="Close">
                        <X size={24} />
                    </button>
                </div>

                {/* Preview */}
                <div className={styles.preview}>
                    <div
                        className={styles.previewText}
                        style={{
                            fontSize: currentStyles.fontSize === 'small' ? '1rem' : currentStyles.fontSize === 'large' ? '1.5rem' : '1.25rem',
                            fontFamily: currentStyles.fontFamily === 'sans-serif' ? 'Inter, sans-serif' : currentStyles.fontFamily === 'serif' ? 'Georgia, serif' : 'inherit',
                            color: currentStyles.textColor,
                            backgroundColor: currentStyles.backgroundColor === 'transparent' ? 'transparent' : currentStyles.backgroundColor === 'semi-black' ? 'rgba(0,0,0,0.75)' : 'rgba(0,0,0,0.95)',
                            textShadow: currentStyles.textShadow ? '2px 2px 4px rgba(0,0,0,0.9)' : 'none',
                            padding: '0.2em 0.4em'
                        }}
                    >
                        Example Subtitle Text
                    </div>
                </div>

                {/* Settings */}
                <div className={styles.settings}>
                    {/* Font Size */}
                    <div className={styles.setting}>
                        <div className={styles.settingHeader}>
                            <Type size={18} />
                            <span className={styles.label}>Font Size</span>
                        </div>
                        <div className={styles.buttonGroup}>
                            <button
                                className={`${styles.optionButton} ${currentStyles.fontSize === 'small' ? styles.active : ''}`}
                                onClick={() => onStyleChange({ fontSize: 'small' })}
                            >
                                Small
                            </button>
                            <button
                                className={`${styles.optionButton} ${currentStyles.fontSize === 'medium' ? styles.active : ''}`}
                                onClick={() => onStyleChange({ fontSize: 'medium' })}
                            >
                                Medium
                            </button>
                            <button
                                className={`${styles.optionButton} ${currentStyles.fontSize === 'large' ? styles.active : ''}`}
                                onClick={() => onStyleChange({ fontSize: 'large' })}
                            >
                                Large
                            </button>
                        </div>
                    </div>

                    {/* Font Family */}
                    <div className={styles.setting}>
                        <div className={styles.settingHeader}>
                            <Type size={18} />
                            <span className={styles.label}>Font Style</span>
                        </div>
                        <div className={styles.buttonGroup}>
                            <button
                                className={`${styles.optionButton} ${currentStyles.fontFamily === 'default' ? styles.active : ''}`}
                                onClick={() => onStyleChange({ fontFamily: 'default' })}
                            >
                                Default
                            </button>
                            <button
                                className={`${styles.optionButton} ${currentStyles.fontFamily === 'sans-serif' ? styles.active : ''}`}
                                onClick={() => onStyleChange({ fontFamily: 'sans-serif' })}
                            >
                                Sans-serif
                            </button>
                            <button
                                className={`${styles.optionButton} ${currentStyles.fontFamily === 'serif' ? styles.active : ''}`}
                                onClick={() => onStyleChange({ fontFamily: 'serif' })}
                            >
                                Serif
                            </button>
                        </div>
                    </div>

                    {/* Text Color */}
                    <div className={styles.setting}>
                        <div className={styles.settingHeader}>
                            <Palette size={18} />
                            <span className={styles.label}>Text Color</span>
                        </div>
                        <div className={styles.buttonGroup}>
                            <button
                                className={`${styles.colorButton} ${currentStyles.textColor === '#FFFFFF' ? styles.active : ''}`}
                                onClick={() => onStyleChange({ textColor: '#FFFFFF' })}
                                style={{ backgroundColor: '#FFFFFF' }}
                                aria-label="White"
                            />
                            <button
                                className={`${styles.colorButton} ${currentStyles.textColor === '#FFD700' ? styles.active : ''}`}
                                onClick={() => onStyleChange({ textColor: '#FFD700' })}
                                style={{ backgroundColor: '#FFD700' }}
                                aria-label="Yellow"
                            />
                            <input
                                type="color"
                                value={currentStyles.textColor}
                                onChange={(e) => onStyleChange({ textColor: e.target.value })}
                                className={styles.colorPicker}
                            />
                        </div>
                    </div>

                    {/* Background */}
                    <div className={styles.setting}>
                        <div className={styles.settingHeader}>
                            <Square size={18} />
                            <span className={styles.label}>Background</span>
                        </div>
                        <div className={styles.buttonGroup}>
                            <button
                                className={`${styles.optionButton} ${currentStyles.backgroundColor === 'transparent' ? styles.active : ''}`}
                                onClick={() => onStyleChange({ backgroundColor: 'transparent' })}
                            >
                                None
                            </button>
                            <button
                                className={`${styles.optionButton} ${currentStyles.backgroundColor === 'semi-black' ? styles.active : ''}`}
                                onClick={() => onStyleChange({ backgroundColor: 'semi-black' })}
                            >
                                Semi
                            </button>
                            <button
                                className={`${styles.optionButton} ${currentStyles.backgroundColor === 'solid-black' ? styles.active : ''}`}
                                onClick={() => onStyleChange({ backgroundColor: 'solid-black' })}
                            >
                                Solid
                            </button>
                        </div>
                    </div>

                    {/* Text Shadow */}
                    <div className={styles.setting}>
                        <div className={styles.settingHeader}>
                            <Eye size={18} />
                            <span className={styles.label}>Text Shadow</span>
                        </div>
                        <div className={styles.buttonGroup}>
                            <button
                                className={`${styles.optionButton} ${currentStyles.textShadow ? styles.active : ''}`}
                                onClick={() => onStyleChange({ textShadow: !currentStyles.textShadow })}
                            >
                                {currentStyles.textShadow ? 'ON' : 'OFF'}
                            </button>
                        </div>
                    </div>

                    {/* Position */}
                    <div className={styles.setting}>
                        <div className={styles.settingHeader}>
                            <MoveVertical size={18} />
                            <span className={styles.label}>Position</span>
                        </div>
                        <div className={styles.buttonGroup}>
                            <button
                                className={`${styles.optionButton} ${currentStyles.position === 'bottom' ? styles.active : ''}`}
                                onClick={() => onStyleChange({ position: 'bottom' })}
                            >
                                Bottom
                            </button>
                            <button
                                className={`${styles.optionButton} ${currentStyles.position === 'raised' ? styles.active : ''}`}
                                onClick={() => onStyleChange({ position: 'raised' })}
                            >
                                Raised
                            </button>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className={styles.footer}>
                    <button onClick={onReset} className={styles.resetButton}>
                        Reset to Default
                    </button>
                </div>
            </div>
        </div>
    )
}
