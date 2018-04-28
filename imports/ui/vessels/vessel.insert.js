import Vessels from '/imports/api/vessels/Vessels.js';
import VesselType from '/imports/api/dropdowns/VesselType.js';

Template['vessel.insert'].helpers({
    data() {
        return {
            backLink: 'vessel.search',
            entityKey: 'vesselId',
            fields: [{
                key: 'name',
                required: true
            }, {
                key: 'flag'
            }, {
                key: 'type',
                type: 'dropdown',
                allowedValues: VesselType.allowedValues,
                required: true
            }, {
                key: 'callsign'
            }, {
                key: 'eni'
            }, {
                key: 'imo'
            }, {
                key: 'mmsi'
            }]
        }
    }
});
