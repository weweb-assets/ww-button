const INFO = {
    submit: 'sub',
    reset: 'rst',
    button: 'btn',
};

export default {
    options: {
        autoByContent: true,
        hyperlink: true,
    },
    editor: {
        label: {
            en: 'Button',
            fr: 'Bouton',
        },
        icon: 'fontawesome/solid/hand-pointer',
        menuOptions: {
            quick: {
                sections: ['ww-link', 'hasLeftIcon', 'hasRightIcon'],
                bind: [{ prop: 'text', label: { en: 'Bind text' } }],
            },
        },
        infoTags: content => {
            if (content.buttonType && INFO[content.buttonType]) {
                return {
                    color: 'var(--ww-color-blue-500)',
                    backgroundColor: 'var(--ww-color-blue-100)',
                    text: INFO[content.buttonType].toUpperCase(),
                    action: () => {
                        wwLib.wwSearchBar.executeAction({
                            actions: wwLib.wwSearchBar.getEditSidebarActions('settings', 'custom-0'),
                        });
                    },
                };
            } else {
                return [];
            }
        },
    },
    properties: {
        text: {
            label: {
                en: 'Text',
                fr: 'Texte',
            },
            type: 'Info',
            options: {
                text: { en: 'Click text to edit' },
            },
            bindable: true,
            multiLang: true,
            defaultValue: {
                en: 'New button',
            },
        },
        font: {
            label: {
                en: 'Typography',
                fr: 'Typography',
            },
            type: 'Typography',
            options: content => ({
                initialValue: {
                    fontSize: content.fontSize,
                    fontFamily: content.fontFamily,
                    fontWeight: content.fontWeight,
                    lineHeight: content.lineHeight,
                },
            }),
            responsive: true,
            states: true,
        },
        fontSize: {
            label: {
                en: 'Size',
                fr: 'Taille',
            },
            type: 'Length',
            options: {
                unitChoices: [
                    { value: 'px', label: 'px', min: 1, max: 100 },
                    { value: 'em', label: 'em', min: 1, max: 10, digits: 2 },
                    { value: 'rem', label: 'rem', min: 1, max: 10, digits: 2 },
                ],
            },
            responsive: true,
            states: true,
            hidden: content => content.font,
            defaultValue: '16px',
        },
        fontFamily: {
            label: {
                en: 'Font family',
                fr: 'Font',
            },
            type: 'FontFamily',
            responsive: true,
            states: true,
            hidden: content => content.font,
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
            responsive: true,
            states: true,
            hidden: content => content.font,
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
                    { value: '', label: 'none', min: 0, max: 10 },
                    { value: '%', label: '%', min: 0, max: 100 },
                    { value: 'em', label: 'em', min: 0, max: 10, digits: 2 },
                    { value: 'em', label: 'rem', min: 0, max: 10, digits: 2 },
                    { value: 'normal', label: 'auto', default: true },
                ],
            },
            responsive: true,
            states: true,
            hidden: content => content.font,
        },
        textAlign: {
            label: {
                en: 'Alignment',
                fr: 'Alignement',
            },
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
            responsive: true,
        },
        color: {
            label: {
                en: 'Text color',
                fr: 'Couleur du texte',
            },
            type: 'Color',
            options: {
                nullable: true,
            },
            bindable: true,
            responsive: true,
            states: true,
        },
        backgroundColor: {
            label: {
                en: 'Text Background',
                fr: 'Background du Texte',
            },
            type: 'Color',
            options: {
                nullable: true,
            },
            bindable: true,
            responsive: true,
            states: true,
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
                    { value: 'capitalize', label: 'Capitalize' },
                    { value: 'uppercase', label: 'UPPERCASE' },
                    { value: 'lowercase', label: 'lowercase' },
                    { value: 'lowercase', label: 'lowercase' },
                ],
            },
            responsive: true,
            states: true,
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
            responsive: true,
            states: true,
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
            responsive: true,
            states: true,
        },
        buttonType: {
            label: {
                en: 'Type',
                fr: 'Type',
            },
            type: 'TextSelect',
            section: 'settings',
            options: {
                options: [
                    { value: null, label: 'none' },
                    { value: 'button', label: 'Button' },
                    { value: 'submit', label: 'Submit Button' },
                    { value: 'reset', label: 'Reset Button' },
                ],
            },
            defaultValue: 'button',
        },
        hasLeftIcon: {
            label: { en: 'Left icon', fr: 'Icône gauche' },
            section: 'settings',
            type: 'OnOff',
        },
        leftIcon: {
            hidden: true,
        },
        hasRightIcon: {
            label: { en: 'Right icon', fr: 'Icône droite' },
            type: 'OnOff',
            section: 'settings',
        },
        rightIcon: {
            hidden: true,
        },
    },
};
