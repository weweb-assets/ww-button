const INFO = {
    submit: 'sub',
    reset: 'rst',
    button: 'btn',
};

export default {
    inherit: 'ww-text',
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
        workflowHint: content => {
            if (content.buttonType !== 'submit') {
                return false;
            }

            return {
                type: 'warning',
                header: {
                    en: 'You probably shouldn’t trigger workflows on submit buttons.',
                    fr: 'Vous ne devriez pas déclencher un workflow depuis un bouton submit',
                },
                text: {
                    en: 'For your users to benefit from automatic form field validation, you should trigger submit workflows on the form container. Unless you are 100% sure of what you’re doing and want to bypass this behavior.',
                    fr: 'Pour que vos utilisateurs bénéficient de la validation automatique des champs de formulaire, vous devez déclencher des workflows de soumission sur le conteneur de formulaire. À moins que vous ne soyez sûr à 100 % de ce que vous faites et que vous souhaitiez contourner ce comportement.',
                },
                button: {
                    text: { en: 'Select form container', fr: 'Selectionnez le form container' },
                    action: 'selectParentFormContainer',
                },
            };
        },
    },
    properties: {
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
