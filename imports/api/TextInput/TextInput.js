import './UpdateForm.tpl.jade';
import './UpdateForm.scss';

module.exports = class UpdateForm {
    constructor(
        db,
        templateName,
        publicationName,
        sections
    ) {
        this.db = db;
        this.templateName = templateName;
        this.publicationName = publicationName;
        this.sections = sections;

        this.isLoading = new ReactiveVar(true);
        this.noResult = new ReactiveVar(true);
        this.language = '';
        this.handle = null;
        this.itemId = '';
        this.item = new ReactiveVar({});

        this.registerHelpers();
        this.registerOnRendered();
        this.registerOnDestroyed();
        this.registerEvents();
    }

    registerHelpers() {
        Template.UpdateForm.helpers({
            'isLoading': () => {
                return this.isLoading.get();
            },
            'noResult': () => {
                return this.noResult.get();
            },
            'sections': () => {
                return this.sections;
            },
            'getTranslatedKey': (key) => {
                return TAPi18n.__(this.templateName + '.' + key);
            },
            'getItemKeyValue': (key) => {
                return this.item.get()[key];
            },
            'getItemKeyDropdown': (key, container) => {
                return TAPi18n.__(this.templateName + '.' + container + '.' + this.item.get()[key]);
            },
            'isDate': (elem) => {
                return elem.type == 'date';
            }
        });
    }

    registerOnRendered() {
        Template.UpdateForm.onRendered(() => {
            $('body').addClass('md-skin');
            $('body').addClass('top-navigation');
            $('body').attr('type', 'UpdateForm');

            this.isLoading.set(true);
            this.noResult.set(false);

            this.itemId = FlowRouter.getParam('itemId');
            var projectId = FlowRouter.getParam('projectId');

            this.handle = Meteor.subscribe(this.publicationName, this.itemId, projectId);

            this.changeObserver = this.db.find({
                _id: this.itemId
            }).observe({
                added: (newItem) => {
                    this.noResult.set(false);
                    this.item.set(newItem);
                },
                changed: (oldItem, newItem) => {
                    if (this.handle.ready()) {
                        this.item.set(newItem);
                        alert('Someone just changed some data on this page. We already pulled these changes for you.')
                        // TODO: translate
                    }
                }
            });

            Tracker.autorun((tracker) => {
                if (this.handle.ready()) {
                    this.isLoading.set(false);
                    tracker.stop();
                }
            });
        });
    }

    registerOnDestroyed() {
        Template.UpdateForm.onDestroyed(() => {
            $('body').removeClass('md-skin');
            $('body').removeClass('top-navigation');
            $('body').attr('type', '');

            if (this.handle !== null) {
                this.handle.stop();
            }

            if (this.changeObserver !== null) {
                this.changeObserver.stop();
            }
        });
    }

    registerEvents() {
        Template.UpdateForm.events({
            'click #cancelChanges': () => {
                // TODO: check for changed content and ask for "really?!"
            },
            'click #saveChanges': () => {
                var isValidating = new ReactiveVar(); // TODO: register in class
                isValidating.set(true);

                var entity = {
                    _id: this.itemId,
                    projectId: FlowRouter.getParam('projectId'),
                    name: $('[name=name]').val().trim(),
                    flag: $('[name=flag]').val().trim(),
                    callsign: $('[name=callsign]').val().trim(),
                    eni: $('[name=eni]').val().trim(),
                    imo: $('[name=imo]').val().trim(),
                    mmsi: $('[name=mmsi]').val().trim()
                };

                Meteor.call('VesselService.update', entity, (e, a) => {
                    console.log(e);
                    console.log(a);
                    // TODO: handle errors
                    // TODO: else handle success
                });
            },
            'click #back': (e) => {
                e.preventDefault();
                wrs(() => {
                    FlowRouter.go(FlowRouter.path(Session.get('parent'), {
                        language: TAPi18n.getLanguage(),
                        projectId: FlowRouter.getParam('projectId')
                    }));
                });
            }
        });
    }
}
