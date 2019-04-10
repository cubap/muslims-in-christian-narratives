export default {
    ID: "deer-id",                  // attribute, URI for resource to render
    TYPE: "deer-type",              // attribute, JSON-LD @type
    TEMPLATE: "deer-template",      // attribute, enum for custom template
    KEY: "deer-key",                // attribute, key to use for annotation
    LABEL: "title",                 // attribute, alternate label for properties
    CONTEXT: "deer-context",        // attribute, JSON-LD @context, scoped
    LIST: "deer-list",              // attribute, property with resource array
    COLLECTION: "deer-collection",  // attribute, name of aggregating collection
    LISTENING: "deer-listening",    // attribute, name of container to watch for clicks
    LINK: "deer-link",              // attribute, location of href#[deer-id] for <a>s
    VIEW: "deer-view, .deer-view",  // selector, identifies render containers
    FORM: "form[deer-type]",        // selector, identifies data entry containers
    SOURCE: "deer-source",          // attribute, URI for asserting annotation
    EVIDENCE: "nv-evidence",        // attribute, URI for supporting evidence
    
    INPUTS: ["input","textarea","dataset","select"], // array of selectors, identifies inputs with .value
    ENTITYNAME: "[deer-key='name']",// selector, value to grab for form entity label

    URLS: {
        BASE_ID: "http://devstore.rerum.io/v1",
        CREATE: "http://tinydev.rerum.io/app/create",
        UPDATE: "http://tinydev.rerum.io/app/update",
        QUERY: "http://tinydev.rerum.io/app/query",
        SINCE: "http://devstore.rerum.io/v1/since"
    },

    EVENTS: {
        CREATED: "deer-created",
        UPDATED: "deer-updated",
        LOADED: "deer-loaded",
        CLICKED: "deer-clicked"
    },

    SUPPRESS: ["__rerum","@context"],   // properties to ignore
    ATTRIBUTION: "testMachine",         // replace with user to attribute assertions

    /**
     * Add any custom templates here through import or copy paste.
     * Templates added here will overwrite the defaults in deer-render.js.
     * 
     * Each property must be lower-cased and return a template literal
     * or an HTML String.
     */
    TEMPLATES: {
        "incident-report": (obj) => `<h5>Reading&hellip; ${obj.name.value || obj.name}</h5>
        <form deer-type="incident">
            <div class="row">
                <input type="hidden" deer-key="isPartOf" value="${obj["@id"]}">
                <label class="col-12 tight">Page</label>
                <input class="col" type="number" deer-key="pageNumber">
                <label class="col-12 tight">Transcription</label>
                <textarea class="col-12" deer-key="transcription"></textarea>
                <input type="submit" class="col" value="Record Instance">
            </div>
        </form>`
    },

    version: "alpha 0.7"
}