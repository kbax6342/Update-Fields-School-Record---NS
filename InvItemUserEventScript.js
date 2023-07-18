/**
 * @NApiVersion 2.1
 * @NScriptType UserEventScript
 */
define(['N/currentRecord', 'N/log', 'N/record', 'N/search'],
    /**
 * @param{currentRecord} currentRecord
 * @param{log} log
 * @param{record} record
 * @param{search} search
 */
    (currentRecord, log, record, search) => {
        /**
         * Defines the function definition that is executed before record is loaded.
         * @param {Object} scriptContext
         * @param {Record} scriptContext.newRecord - New record
         * @param {string} scriptContext.type - Trigger type; use values from the context.UserEventType enum
         * @param {Form} scriptContext.form - Current form
         * @param {ServletRequest} scriptContext.request - HTTP request information sent from the browser for a client action only.
         * @since 2015.2
         */
        const beforeLoad = (scriptContext) => {

        }

        /**
         * Defines the function definition that is executed before record is submitted.
         * @param {Object} scriptContext
         * @param {Record} scriptContext.newRecord - New record
         * @param {Record} scriptContext.oldRecord - Old record
         * @param {string} scriptContext.type - Trigger type; use values from the context.UserEventType enum
         * @since 2015.2
         */
        const beforeSubmit = (scriptContext) => {
            var newRecord = scriptContext.newRecord

            var standardRoyalty = newRecord.getValue({
                fieldId: 'custrecord_lf_school_std_roy_perc'
            });
            var headwearRoyalty = newRecord.getValue({
                fieldId: 'custrecord_lf_school_hdwr_roy_perc'
            })

            const schoolName = newRecord.getValue({
                fieldId: 'id'
            });

            var inventoryitemSearchObj = search.create({
                type: "inventoryitem",
                filters:
                    [
                        ["type","anyof","InvtPart"],
                        "AND",
                        ["isspecialorderitem","any",""],
                        "AND",
                        ["custitem_lf_embellishment","any",""],
                        "AND",
                        ["custitem_lf_school","any",schoolName]
                    ],
                columns:
                    [
                        search.createColumn({
                            name: "itemid",
                            sort: search.Sort.ASC,
                            label: "Name"
                        }),
                        search.createColumn({name: "displayname", label: "Display Name"}),
                        search.createColumn({name: "salesdescription", label: "Description"}),
                        search.createColumn({name: "type", label: "Type"}),
                        search.createColumn({name: "baseprice", label: "Base Price"}),
                        search.createColumn({name: "custitem_atlas_item_planner", label: "Planner"}),
                        search.createColumn({name: "custitem_lf_weld_list", label: "LF | Weld List"}),
                        search.createColumn({name: "custitem_sps_item_synch", label: "SPS Item Synch"}),
                        search.createColumn({name: "custitem_lf_royalty_code", label: "LF | Royalty Code"})
                    ]
            });
            var searchResultCount = inventoryitemSearchObj.runPaged().count;
            log.debug("inventoryitemSearchObj result count",searchResultCount);
            inventoryitemSearchObj.run().each(function(result){
                var customerId = result.id;
                var id = record.submitFields({
                    type: record.Type.CUSTOMER,
                    id: customerId,
                    values: {
                        'custentity_lf_hdwr_roy_new': headwearRoyalty,
                        'custentity_lf_std_roy_rate_new': standardRoyalty
                    }
                });
                return true;
            });


        }

        /**
         * Defines the function definition that is executed after record is submitted.
         * @param {Object} scriptContext
         * @param {Record} scriptContext.newRecord - New record
         * @param {Record} scriptContext.oldRecord - Old record
         * @param {string} scriptContext.type - Trigger type; use values from the context.UserEventType enum
         * @since 2015.2
         */
        const afterSubmit = (scriptContext) => {

        }

        return {beforeLoad, beforeSubmit, afterSubmit}

    });
