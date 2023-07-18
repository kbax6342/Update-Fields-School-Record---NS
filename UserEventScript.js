/**
 * @NApiVersion 2.1
 * @NScriptType UserEventScript
 */


define(['N/currentRecord', 'N/record', 'N/search', 'N/log'],
    /**
 * @param{currentRecord} currentRecord
 * @param{record} record
 */
    (currentRecord, record, search, log) => {
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


            var customerSearchObj = search.create({
                type: "customer",
                filters:
                    [ 'custentity_lf_school_record', 'is', schoolName],
                columns:
                    [
                        search.createColumn({
                            name: "entityid",
                            sort: search.Sort.ASC,
                            label: "Name"
                        }),
                        search.createColumn({name: "email", label: "Email"}),
                        search.createColumn({name: "phone", label: "Phone"}),
                        search.createColumn({name: "altphone", label: "Office Phone"}),
                        search.createColumn({name: "fax", label: "Fax"}),
                        search.createColumn({name: "contact", label: "Primary Contact"}),
                        search.createColumn({name: "altemail", label: "Alt. Email"}),
                        search.createColumn({name: "custentity_4599_sg_uen", label: "UEN"}),
                        search.createColumn({name: "custentity_my_brn", label: "BRN"}),
                        search.createColumn({name: "custentity_9572_refundcust_entitybnk_sub", label: "Customer Refund Entity Bank Subsidiary"}),
                        search.createColumn({name: "custentity_9572_refcust_entitybnkformat", label: "Customer Refund Entity Bank Format"}),
                        search.createColumn({name: "custentity_9572_custref_file_format", label: "Cust Ref File Format"}),
                        search.createColumn({name: "custentity_9572_ddcust_entitybank_sub", label: "Customer DD Entity Bank Subsidiary"}),
                        search.createColumn({name: "custentity_9572_ddcust_entitybnkformat", label: "Customer DD Entity Bank Format"}),
                        search.createColumn({name: "custentity_9572_dd_file_format", label: "Direct Debit File Format"})
                    ]
            });

            var searchResultCount = customerSearchObj.runPaged().count;

                log.debug("school id", schoolName)

            customerSearchObj.run().each(function (result) {
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
                        ["custitem_lf_school","is",schoolName]
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
                    type: record.Type.INVENTORY_ITEM,
                    id: customerId,
                    values: {
                        'custitem_lf_hdwr_roy_new': headwearRoyalty,
                        'custitem_lf_std_roy_rate': standardRoyalty
                    }
                });
                log.debug("invetory item id", customerId)
                return true;
            });

          // Assembly Item

            var assemblyitemSearchObj = search.create({
                type: "assemblyitem",
                filters:
                    [
                        ["type","anyof","Assembly"],
                        "AND",
                        ["isinactive","any",""],
                        "AND",
                        ["custitem_lf_school","is",schoolName]
                    ],
                columns:
                    [
                        search.createColumn({
                            name: "itemid",
                            sort: search.Sort.ASC,
                            label: "Name"
                        }),
                        search.createColumn({name: "custitem_lf_weld_list", label: "LF | Weld List"}),
                        search.createColumn({name: "custitem_lf_royalty_code", label: "LF | Royalty Code"}),
                        search.createColumn({name: "custitem_lf_school_name", label: "School Name"}),
                        search.createColumn({name: "isinactive", label: "Inactive"})

                    ]
            });
            var searchResultCountAssm = assemblyitemSearchObj.runPaged().count;
            log.debug("assemblyitemSearchObj result count",searchResultCountAssm);
            assemblyitemSearchObj.run().each(function(result){
                var customerId = result.id;
                var id = record.submitFields({
                    type: record.Type.ASSEMBLY_ITEM,
                    id: customerId,
                    values: {
                        'custitem_lf_hdwr_roy_new': headwearRoyalty,
                        'custitem_lf_std_roy_rate': standardRoyalty
                    }
                });
                log.debug("invetory item id", customerId)
                return true;
            });

            /*
            assemblyitemSearchObj.id="customsearch1686233759217";
            assemblyitemSearchObj.title="LF | Assembly List  - CS (copy)";
            var newSearchId = assemblyitemSearchObj.save();
            */

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


            var customerSearchObj = search.create({
                type: "customer",
                filters:
                    [ 'custentity_lf_school_record', 'is', schoolName],
                columns:
                    [
                        search.createColumn({
                            name: "entityid",
                            sort: search.Sort.ASC,
                            label: "Name"
                        }),
                        search.createColumn({name: "email", label: "Email"}),
                        search.createColumn({name: "phone", label: "Phone"}),
                        search.createColumn({name: "altphone", label: "Office Phone"}),
                        search.createColumn({name: "fax", label: "Fax"}),
                        search.createColumn({name: "contact", label: "Primary Contact"}),
                        search.createColumn({name: "altemail", label: "Alt. Email"}),
                        search.createColumn({name: "custentity_4599_sg_uen", label: "UEN"}),
                        search.createColumn({name: "custentity_my_brn", label: "BRN"}),
                        search.createColumn({name: "custentity_9572_refundcust_entitybnk_sub", label: "Customer Refund Entity Bank Subsidiary"}),
                        search.createColumn({name: "custentity_9572_refcust_entitybnkformat", label: "Customer Refund Entity Bank Format"}),
                        search.createColumn({name: "custentity_9572_custref_file_format", label: "Cust Ref File Format"}),
                        search.createColumn({name: "custentity_9572_ddcust_entitybank_sub", label: "Customer DD Entity Bank Subsidiary"}),
                        search.createColumn({name: "custentity_9572_ddcust_entitybnkformat", label: "Customer DD Entity Bank Format"}),
                        search.createColumn({name: "custentity_9572_dd_file_format", label: "Direct Debit File Format"})
                    ]
            });

            var searchResultCount = customerSearchObj.runPaged().count;

            log.debug("school id", schoolName)

            customerSearchObj.run().each(function (result) {
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
                        ["custitem_lf_school","is",schoolName]
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
                    type: record.Type.INVENTORY_ITEM,
                    id: customerId,
                    values: {
                        'custitem_lf_hdwr_roy_new': headwearRoyalty,
                        'custitem_lf_std_roy_rate': standardRoyalty
                    }
                });
                log.debug("invetory item id", customerId)
                return true;
            });

            // Assembly Item

            var assemblyitemSearchObj = search.create({
                type: "assemblyitem",
                filters:
                    [
                        ["type","anyof","Assembly"],
                        "AND",
                        ["isinactive","any",""],
                        "AND",
                        ["custitem_lf_school","is",schoolName]
                    ],
                columns:
                    [
                        search.createColumn({
                            name: "itemid",
                            sort: search.Sort.ASC,
                            label: "Name"
                        }),
                        search.createColumn({name: "custitem_lf_weld_list", label: "LF | Weld List"}),
                        search.createColumn({name: "custitem_lf_royalty_code", label: "LF | Royalty Code"}),
                        search.createColumn({name: "custitem_lf_school_name", label: "School Name"}),
                        search.createColumn({name: "isinactive", label: "Inactive"})

                    ]
            });
            var searchResultCountAssm = assemblyitemSearchObj.runPaged().count;
            log.debug("assemblyitemSearchObj result count",searchResultCountAssm);
            assemblyitemSearchObj.run().each(function(result){
                var customerId = result.id;
                var id = record.submitFields({
                    type: record.Type.ASSEMBLY_ITEM,
                    id: customerId,
                    values: {
                        'custitem_lf_hdwr_roy_new': headwearRoyalty,
                        'custitem_lf_std_roy_rate': standardRoyalty
                    }
                });
                log.debug("invetory item id", customerId)
                return true;
            });

        }

        return {beforeLoad, beforeSubmit, afterSubmit}

    });
