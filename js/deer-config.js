import { default as UTILS } from 'https://centerfordigitalhumanities.github.io/deer/js/deer-utils.js'
import { default as tagsInput } from './tags-input.js'

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

    INPUTS: ["input", "textarea", "dataset", "select"], // array of selectors, identifies inputs with .value
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

    SUPPRESS: ["__rerum", "@context"],   // properties to ignore
    ATTRIBUTION: "testMachine",         // replace with user to attribute assertions

    /**
     * Add any custom templates here through import or copy paste.
     * Templates added here will overwrite the defaults in deer-render.js.
     * 
     * Each property must be lower-cased and return a template literal
     * or an HTML String.
     */
    TEMPLATES: {
        "incident-report": (obj, options) => {
            return { html: `<h5 class="row">Reading&hellip; <cite>${UTILS.getLabel(obj)}</cite></h5>
                <p>${UTILS.getValue(obj.description)}</p>
                <deer-view deer-collection="estes-characters" deer-template="people" id="characterList"></deer-view>
                <form deer-type="Person" deer-context="http://schema.org" id="addPersonForm">
                    <p>Click a name to record a mention in <cite>${UTILS.getLabel(obj)}</cite></p>
                    <input type="hidden" deer-key="targetCollection" value="estes-characters">
                    <div class="row">
                        <input placeholder="Label for new character" class="col" deer-key="name">
                        <button type="submit" class="col"><i class="fas fa-plus"></i> Character</button>
                    </div>
                </form>
                <form deer-type="incident" id="incidentForm" deer-listening="mentionsList" class="is-hidden">
                    <div class="row">
                        <input type="hidden" deer-key="isPartOf" value="${obj["@id"]}">
                        <input type="hidden" deer-key="about" value="">
                        <h5>Identifying&hellip; <output id="folks"></output></h5>
                        <label class="col-12 tight">Page</label>
                        <input class="col" type="number" deer-key="pageNumber">
                        <label class="col-12 tight">Transcription</label>
                        <textarea class="col-12" deer-key="transcription"></textarea>
                        <label class="col-12 tight">Tags (delimit with <kbd>,</kbd>, <kbd>TAB</kbd>, <kbd>ENTER</kbd>)</label>
                        <input type="tags" name="col-12" deer-key="tags">
                        <input type="submit" class="col" value="Record Mention">
                    </div>
                </form>`,
            then: (elem,obj,options)=>{
                elem.addEventListener("deer-loaded",(e)=>{
                    Array.from(e.target.getElementsByClassName("tags-input")).forEach(el=>el.parentNode.removeChild(el))
                    tagsInput(e.target.querySelector("[type='tags']"))
                })
            } }
        },
        people: (list) => {
            let tmpl = ``
            const addCharacter = new MutationObserver(addClick)
            addCharacter.observe(characterList, {
                childList: true
            })
            function addClick(mutationsList) {
                for (var mutation of mutationsList) {
                    mutation.target.onclick = (event) => addPersonToIncident(event.target, incidentForm.querySelector("[deer-key='about']"))
                }
            }

            function addPersonToIncident(person, incident) {
                let id = person.getAttribute("deer-id")
                if (id === null || person.tagName !== "SPAN") return false
                let title = person.textContent
                incident.title = title
                incident.value = id
                folks.textContent = incident.title
                let tagelems = document.getElementsByClassName('tags-input')
                Array.from(tagelems).forEach(elem=>elem.parentNode.removeChild(elem))
                tagsInput(document.querySelector('input[type="tags"]'))
                addPersonForm.classList.add("is-hidden")
                incidentForm.classList.remove("is-hidden")
                characterList.classList.add("is-hidden")
                addMentions(id)
                incidentForm.reset()
            }

            function addMentions(personId) {
                let obj = {
                    "body.about.value": personId
                }
                fetch("http://tinydev.rerum.io/app/query", {
                    method: "POST",
                    body: JSON.stringify(obj),
                    headers: {
                        "Content-Type": "application/json"
                    }
                })
                    .then(response => response.json())
                    .then(m => {
                        if (m.length > 0) {
                            mentionsList.innerHTML = m.reduce((a, b) => a += `<div><a href="#${UTILS.getValue(b.target)}"><i class="fas fa-bookmark"></i> ${UTILS.getLabel(UTILS.expand(b.target), "Incident " + b.__rerum.createdAt)}</a></div>`, ``)
                            mentionsContainer.classList.remove("is-hidden")
                        } else {
                            mentionsContainer.classList.add("is-hidden")
                        }
                    })
                    .catch((err) => console.log(err))
            }

            return tmpl += list.itemListElement.reduce((a, b) => a += `<span class="tag" deer-id="${b["@id"]}">${UTILS.getLabel(b)}</span>`, ``)
        },
        texts: function (obj, options = {}) {
            let tmpl = `<h2>${UTILS.getLabel(obj)}</h2>`
            if (options.list) {
                obj[options.list].forEach((val, index) => {
                    let name = UTILS.getLabel(val, (val.type || val['@type'] || label + index))
                    tmpl += (val["@id"] && options.link) ? `<div deer-id="${val["@id"]}" schema-mentions="${val.mentions}"><a href="${options.link}${val["@id"]}"><i class="fas fa-book"></i> ${name}</a></div>` : `<div deer-id="${val["@id"]}" schema-mentions="${val.mentions}"><i class="fas fa-book"></i> ${name}</div>`
                })
            }

            return tmpl
        }
    },

    version: "alpha 0.7"
}