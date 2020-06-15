export default {
    namespaced: true,

    state: {
        items: [],
        loaded: false,
        baseApiUrl: '',
        collectionName: 'items',
    },

    getters: {
        findById: state => id => {
            return state[state.collectionName].findIndex(item => parseInt(item.id) === parseInt(id));
        },
        getById: state => id => {
            return state[state.collectionName].find(item => parseInt(item.id) === parseInt(id));
        },
        totalCount: state => state[state.collectionName].length,
        paginate: state => (params = {}) => {
            let {page, perPage} = {
                page: 1,
                perPage: 15,
                ...params,
            };
            let startIndex = perPage * (page - 1);
            let all = params.forceItems ?
                params.forceItems :
                state[state.collectionName];
            let items = all.slice(startIndex, startIndex + perPage);

            let total = all.length;
            let pagesCount = Math.ceil(total / perPage);
            let from = items.length ? startIndex + 1 : 0;
            let to = items.length ? startIndex + items.length : 0;
            return {
                items, from, to, pagesCount, currentPage: page, total
            };
        },
    },

    mutations: {
        UPDATE_INFO(state, items) {
            state[state.collectionName] = items;
        },
        SET_LOADED(state, loaded) {
            state.loaded = loaded;
        },
        ADD(state, item) {
            state[state.collectionName].push(item);
        },
        REMOVE(state, index) {
            state[state.collectionName].splice(index, 1);
        },
        UPDATE(state, {index, item}) {
            state[state.collectionName][index] = item;
        },
    },

    actions: {
        async updateInfo({state, commit}, force = false) {
            if(state.loaded && !force)
                return;
            var items = await apiRequest.get(state.baseApiUrl);
            commit('UPDATE_INFO', items);
            commit('SET_LOADED', true);
        },

        async add({commit, state}, item){
            commit('SET_PROCESSING', true, {root: true});
            var resultItem = await apiRequest.post(state.baseApiUrl, item);
            commit('SET_PROCESSING', false, {root: true});
            commit('ADD', resultItem);
            return resultItem;
        },

        async remove({commit, getters, state}, id){
            commit('SET_PROCESSING', true, {root: true});
            await apiRequest.delete(state.baseApiUrl + '/' + id);
            commit('SET_PROCESSING', false, {root: true});
            let index = getters.findById(id);
            if(index >= 0)
                commit('REMOVE', index);
        },

        async update({commit, getters, state}, item) {
            commit('SET_PROCESSING', true, {root: true});
            let resultItem = await apiRequest.post(state.baseApiUrl + '/' + item.id, {
                ...item,
                _method: 'PATCH'
            });

            commit('SET_PROCESSING', false, {root: true});
            let index = getters.findById(item.id);
            if(index >= 0)
                commit('UPDATE', {
                    index,
                    item: resultItem
                });
        },

        async save({dispatch}, item) {
            if(item.id){
                return await dispatch('update', item);
            }

            return await dispatch('add', item);
        }
    },
}
