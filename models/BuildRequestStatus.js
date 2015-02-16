module.exports = {

    // default / fallback / status cannot be mapped / invalid status
    unknown: {
        value: 'unknown',
        inherits: false
    },

    // client's request has been registered and will be uploaded
    registered: {
        value: 'registered',
        inherits: false
    },

    // files are being uploaded
    uploading: {
        value: 'uploading',
        inherits: false
    },

    // one or more builds are being processed by the agents
    processing: {
        value: 'processing',
        inherits: false
    },

    // something went wrong (client / agent / master)
    failed: {
        value: 'failed',
        inherits: true
    },

    // request has been cancelled by the user
    cancelled: {
        value: 'cancelled',
        inherits: true
    },

    // all builds finished (without fatal errors)
    finished: {
        value: 'finished',
        inherits: false
    }
};