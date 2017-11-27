import './InsertForm.tpl.jade';
import './InsertForm.scss';

import './InsertFormTextInput.js';
import './InsertFormDateInput.js';
import './InsertFormDropdownInput.js';

Template.InsertForm.helpers({
    'getBackLink': () => {
        return FlowRouter.path(FlowRouter.getRouteName().replace('insert', 'search'), {
            language: FlowRouter.getParam('language'),
            projectId: FlowRouter.getParam('projectId')
        });
    },
    'getFields': () => {
        return Template.instance().fields;
    },
    'isText': (field) => {
        return !('dropdown' in field || field.type == Date);
    },
    'isDate': (field) => {
        return field.type == Date;
    },
    'isDropdown': (field) => {
        return 'dropdown' in field;
    },
    'getInputData': () => {
        return {
            key: Template.currentData().key,
            parentInstance: Template.instance()
        };
    }
});

Template.InsertForm.onCreated(() => {
    const template = Template.instance();
    const data = Template.currentData().data;

    template.db = data.db;
    template.fields = data.fields;

    template.setFieldValue = (key, value) => {
        console.log(key);
        console.log(value);
    }
});

Template.InsertForm.onRendered(() => {
    $('body').addClass('md-skin');
    $('body').addClass('top-navigation');
    $('body').attr('type', 'InsertForm');
});

Template.InsertForm.onDestroyed(() => {
    $('body').removeClass('md-skin');
    $('body').removeClass('top-navigation');
    $('body').attr('type', '');
});
