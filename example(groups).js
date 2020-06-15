import BaseResourceModule from '../BaseResourceModule';

export default {
    ...BaseResourceModule,

    state: {
        groups: [],
        loaded: false,
        baseApiUrl: '/api/groups',
        collectionName: 'groups',
    },

    getters: {
        ...BaseResourceModule.getters,
        forCourse: state => course => {
            return state[state.collectionName].filter(group => {
                return Math.ceil(group.semester / 2) === course;
            });
        },
    },
};
