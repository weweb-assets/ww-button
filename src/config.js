function getTypoOptions(content) {
    const options = {
        font: {
            type: 'Typography',
            label: {
                en: 'Typography',
                fr: 'Typography',
            },
            options: {
                initialValue: {
                    fontSize: content.fontSize,
                    fontFamily: content.fontFamily,
                    fontWeight: content.fontWeight,
                    lineHeight: content.lineHeight,
                },
            },
        },
    };
    if (!content.font) {
        Object.assign(options, {
            fontSize: {
                type: 'Length',
                label: {
                    en: 'Size',
                    fr: 'Taille',
                },
                options: {
                    unitChoices: [{ value: 'px', label: 'px', min: 1, max: 100 }],
                },
            },
            fontFamily: {
                type: 'FontFamily',
                label: {
                    en: 'Font family',
                    fr: 'Font',
                },
            },
            fontWeight: {
                label: {
                    en: 'Font weight',
                    fr: 'Graisse',
                },
                type: 'TextSelect',
                options: {
                    options: [
                        { value: null, label: { en: 'Default', fr: 'Par défaut' } },
                        { value: 100, label: { en: '100 - Thin' } },
                        { value: 200, label: { en: '200 - Extra Light' } },
                        { value: 300, label: { en: '300 - Light' } },
                        { value: 400, label: { en: '400 - Normal' } },
                        { value: 500, label: { en: '500 - Medium' } },
                        { value: 600, label: { en: '600 - Semi Bold' } },
                        { value: 700, label: { en: '700 - Bold' } },
                        { value: 800, label: { en: '800 - Extra Bold' } },
                        { value: 900, label: { en: '900 - Black' } },
                    ],
                },
            },
            lineHeight: {
                label: {
                    en: 'Line height',
                    fr: 'Hauteur de ligne',
                },
                type: 'Length',
                options: {
                    unitChoices: [
                        { value: 'px', label: 'px', min: 0, max: 100 },
                        { value: '%', label: '%', min: 0, max: 100 },
                        { value: 'em', label: 'em', min: 0, max: 100 },
                        { value: 'normal', label: 'auto', default: true },
                    ],
                },
            },
        });
    }

    return options;
}

const INFO = {
    submit: 'sub',
    reset: 'rst',
    button: 'btn',
};

export function getConfig(content) {
    const config = {
        styleOptions: {
            ...getTypoOptions(content),
            textAlign: {
                type: 'TextRadioGroup',
                options: {
                    choices: [
                        {
                            value: 'left',
                            default: true,
                            title: { en: 'Left', fr: 'Gauche' },
                            icon: 'text-align-left',
                        },
                        { value: 'center', title: { en: 'Center', fr: 'Milieu' }, icon: 'text-align-center' },
                        { value: 'right', title: { en: 'Right', fr: 'Droite' }, icon: 'text-align-right' },
                        {
                            value: 'justify',
                            title: { en: 'Justify', fr: 'Justifié' },
                            icon: 'text-align-justify',
                        },
                    ],
                },
                label: {
                    en: 'Alignement',
                    fr: 'Alignement',
                },
            },
            color: {
                type: 'Color',
                label: {
                    en: 'Text color',
                    fr: 'Couleur du texte',
                },
                bindable: true,
                options: {
                    nullable: true,
                },
            },
            backgroundColor: {
                type: 'Color',
                label: {
                    en: 'Text Background',
                    fr: 'Background du Texte',
                },
                bindable: true,
                options: {
                    nullable: true,
                },
            },
            textTransform: {
                label: {
                    en: 'Character case',
                    fr: 'Character case',
                },
                type: 'TextSelect',
                options: {
                    options: [
                        { value: null, label: 'none' },
                        { value: 'capitalize', label: 'capitalize' },
                        { value: 'uppercase', label: 'uppercase' },
                        { value: 'lowercase', label: 'lowercase' },
                    ],
                },
            },
            textShadow: {
                label: {
                    en: 'Text Shadows',
                    fr: 'Ombres du texte',
                },
                type: 'Shadows',
                options: {
                    isText: true,
                },
            },
            wordSpacing: {
                label: {
                    en: 'Word spacing',
                    fr: 'Espacement des mots',
                },
                type: 'Length',
                options: {
                    unitChoices: [{ value: 'px', label: 'px', min: 0, max: 100 }],
                },
            },
        },
    };

    if (content.buttonType && INFO[content.buttonType]) {
        config.infoTag = {
            color: 'var(--ww-color-blue-500)',
            text: INFO[content.buttonType],
            action: () => {
                wwLib.wwSearchBar.executeAction({
                    actions: wwLib.wwSearchBar.getEditSidebarActions('settings', 'custom-0'),
                });
            },
        };
    }

    return config;
}
