import { Vessels } from '/imports/api/vessels/vessels.coffee'
import getLanguages from '/imports/api/util/languages.js'

import './publish/vessel.search.coffee'

const PersistenceManager = require('/imports/api/persistence/PersistenceManager.js');

Meteor.methods({
    'vessel.get': ({ language, projectId, vesselId }) => {
        return Projects.find(projectId, { fields: { vesselModule: 1 } }) // TODO: write a function for this check
        .fetch()
        .filter((project) => project.vesselModule)
        .reduce(() => getExtendedVessel(vesselId, language), {});
    },
    'vessel.getField': ({ language, projectId, vesselId, key }) => {
        return Projects.find(projectId, { fields: { vesselModule: 1 } })
        .fetch()
        .filter((project) => project.vesselModule)
        .reduce(() => getExtendedVessel(vesselId, language), {})[key];
    },
    'vessel.insert': ({ language, projectId }, vessel) => {
        const project = Projects.findOne(projectId, { fields: { vesselModule: 1 } });

        if (project != null && project.vesselModule) {
            try {
                new PersistenceManager(Vessels).insert(vessel);
                return vessel._id;
            } catch(e) {
                throw new Meteor.Error(e);
            }
        }
    },
    'vessel.update': ({ language, projectId, vesselId }, key, value) => {
        const project = Projects.findOne(projectId, { fields: { vesselModule: 1 } });

        if (project != null && project.vesselModule) {
            try {
                new PersistenceManager(Vessels).update(vesselId, key, value);
            } catch(e) {
                throw new Meteor.Error(e);
            }
        }
    },
    'vessel.visit.insert': ({ projectId, vesselId }, visit) => {
        const project = Projects.findOne(projectId, { fields: { vesselModule: 1 } });

        if (project != null && project.vesselModule) {
            let visits = Vessels.findOne(vesselId).visits;

            if(visits == null) {
                visits = [];
            }

            visit._id = Random.id();
            visit.projectId = projectId;
            delete visit.userId
            visits.push(visit);

            try {
                new PersistenceManager(Vessels).update(vesselId, 'visits', visits);
                return visit._id;
            } catch(e) {
                throw new Meteor.Error(e);
            }
        }
    },
    'vessel.visit.getAvailableHarbors': ({ projectId }) => {
        return Projects.find(projectId, { fields: { vesselModule: 1, harbors: 1 } })
        .fetch()
        .filter((project) => project.vesselModule)
        .reduce((acc, project) => acc.concat(project.harbors), [])
        .map(({_id, name}) => { return { key: _id, value: name } });
    },
    'vessel.visit.getLast': ({ language, projectId, vesselId }) => {
        return Projects.find(projectId, { fields: { vesselModule: 1 } })
        .fetch()
        .filter((project) => project.vesselModule)
        .reduce(() => getExtendedVessel(vesselId, language).visits, [])
        .pop();
    },
    'vessel.visit.getField': ({ language, projectId, vesselId, visitId, key }) => {
        return Projects.find(projectId, { fields: { vesselModule: 1 } })
        .fetch()
        .filter((project) => project.vesselModule)
        .reduce(() => getExtendedVessel(vesselId, language).visits, [])
        .pop()[key];
    },
    'vessel.visit.update': ({ language, projectId, vesselId, visitId }, key, value) => {
        const project = Projects.findOne(projectId, { fields: { vesselModule: 1 } });

        if (project != null && project.vesselModule) {
            const extendedVisits = getExtendedVessel(vesselId, language).visits;

            // only author can update visit
            if (extendedVisits.length == 0 || extendedVisits[0].createdBy != Meteor.userId()) {
                return;
            }

            // only last visit can be updated
            if (visitId != extendedVisits[0]._id) {
                return;
            }

            const visits = Vessels.findOne(vesselId).visits.map((visit) => {
                if (visit._id == visitId) {
                    visit[key] = value;
                }
                return visit;
            });

            try {
                new PersistenceManager(Vessels).update(vesselId, 'visits', visits);
            } catch(e) {
                throw new Meteor.Error(e);
            }
        }
    },
    'vessel.visit.delete': ({ language, projectId, vesselId, visitId }) => {
        const project = Projects.findOne(projectId, { fields: { vesselModule: 1 } });

        if (project != null && project.vesselModule) {
            const extendedVisits = getExtendedVessel(vesselId, language).visits;

            // only author can delete visit
            if (extendedVisits.length == 0 || extendedVisits[0].createdBy != Meteor.userId()) {
                return;
            }

            // only last visit can be deleted
            if (visitId != extendedVisits[0]._id) {
                return;
            }

            const visits = Vessels.findOne(vesselId).visits.filter((visit) => visit._id != visitId);

            try {
                new PersistenceManager(Vessels).update(vesselId, 'visits', visits);
            } catch(e) {
                throw new Meteor.Error(e);
            }
        }
    },
    'vessel.visit.language.insert': ({ language, projectId, vesselId, visitId }, { languageId }) => {
        const project = Projects.findOne(projectId, { fields: { vesselModule: 1 } });

        if (project != null && project.vesselModule) {
            const extendedVisits = getExtendedVessel(vesselId, language).visits;

            // only author can update visit
            if (extendedVisits.length == 0 || extendedVisits[0].createdBy != Meteor.userId()) {
                return;
            }

            // only last visit can be updated
            if (visitId != extendedVisits[0]._id) {
                return;
            }

            const visits = Vessels.findOne(vesselId).visits.map((visit) => {
                if(visit.languageIds == null) {
                    visit.languageIds = [];
                }
                if (visit._id == visitId) {
                    visit.languageIds.push(languageId);
                }
                return visit;
            });

            try {
                new PersistenceManager(Vessels).update(vesselId, 'visits', visits);
            } catch(e) {
                throw new Meteor.Error(e);
            }
        }
    },
    'vessel.visit.language.delete': ({ language, projectId, vesselId, visitId }, languageId) => {
        const project = Projects.findOne(projectId, { fields: { vesselModule: 1 } });

        if (project != null && project.vesselModule) {
            const extendedVisits = getExtendedVessel(vesselId, language).visits;

            // only author can update visit
            if (extendedVisits.length == 0 || extendedVisits[0].createdBy != Meteor.userId()) {
                return;
            }

            // only last visit can be updated
            if (visitId != extendedVisits[0]._id) {
                return;
            }

            const visits = Vessels.findOne(vesselId).visits.map((visit) => {
                if (visit._id == visitId) {
                    visit.languageIds = visit.languageIds.filter((langId) => langId != languageId);
                }
                return visit;
            });

            try {
                new PersistenceManager(Vessels).update(vesselId, 'visits', visits);
            } catch(e) {
                throw new Meteor.Error(e);
            }
        }
    }
});

function getExtendedVessel(vesselId, interfaceLanguage = 'en') {
    let vessel = Vessels.findOne(vesselId);

    if (vessel != undefined) {
        if ('visits' in vessel) {
            if (vessel.visits.length > 1) {
                vessel.visits.sort((a, b) => {
                    return a.createdAt - b.createdAt;
                });
                vessel.visits = [vessel.visits.pop()];
            }

            if (vessel.visits.length > 0) {
                if (vessel.visits[0].isUserVisible) {
                    const author = Meteor.users.findOne(vessel.visits[0].createdBy, {
                        fields: {
                            'profile.firstname': 1,
                            'profile.lastname': 1,
                            'profile.telefon': 1,
                            'profile.email': 1
                        }
                    });

                    vessel.visits[0].person = author.profile.firstname + ' ' + author.profile.lastname;
                    vessel.visits[0].email = author.profile.email;
                    vessel.visits[0].phone = author.profile.telefon;
                } else {
                    vessel.visits[0].person = 'Not visible';
                    vessel.visits[0].email = '';
                    vessel.visits[0].phone = '';
                }

                const project = Projects.findOne(vessel.visits[0].projectId, {
                    fields: {
                        country: 1,
                        harborGroup: 1,
                        harbors: 1
                    }
                });

                vessel.visits[0].country = project.country;
                vessel.visits[0].harborGroup = project.harborGroup;

                const harbor = project.harbors.filter((harbor) => {
                    return harbor._id == vessel.visits[0].harborId;
                })[0];

                vessel.visits[0].harbor = harbor.name;

                if (vessel.visits[0].languageIds == null) {
                    vessel.visits[0].languageIds = [];
                }

                const allLanguages = getLanguages();
                const languages = vessel.visits[0].languageIds
                .filter((language) => allLanguages.indexOf(language) > -1)
                .map((language) => TAPi18n.__('language._' + language, {}, interfaceLanguage));

                vessel.visits[0].languages = languages.join(', ');
            }
        } else {
            vessel.visits = [];
        }
    }

    return vessel;
}