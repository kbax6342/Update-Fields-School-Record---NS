/**
 * @NApiVersion 2.1
 * @NScriptType MapReduceScript
 */
define(['N/currentRecord', 'N/record', 'N/search', 'N/runtime'],
    /**
     * @param{currentRecord} currentRecord
     * @param{record} record
     * @param{search} search
     */
    (currentRecord, record, search, runtime) => {
        /**
         * Defines the function that is executed at the beginning of the map/reduce process and generates the input data.
         * @param {Object} inputContext
         * @param {boolean} inputContext.isRestarted - Indicates whether the current invocation of this function is the first
         *     invocation (if true, the current invocation is not the first invocation and this function has been restarted)
         * @param {Object} inputContext.ObjectRef - Object that references the input data
         * @typedef {Object} ObjectRef
         * @property {string|number} ObjectRef.id - Internal ID of the record instance that contains the input data
         * @property {string} ObjectRef.type - Type of the record instance that contains the input data
         * @returns {Array|Object|Search|ObjectRef|File|Query} The input data to use in the map/reduce process
         * @since 2015.2
         */





        function getInputData() {

            try {

                var script = runtime.getCurrentScript();

                var schoolId = script.getParameter({name: 'custscript_school_id'})
                var schoolName = script.getParameter({name: 'custscript_school_name_param'})

                var uniqueID = Math.floor(Math.random() * (Math.random() * 20) + 100) + 5

                var anotherValue = uniqueID + 44

                var array1 = []
                var array2 = []
                var array3 = []


                var customSearch = search.create({
                    type: search.Type.CUSTOMER,
                    title: 'custsearch_' + anotherValue,
                    id: 'customsearch_customer_' + uniqueID,
                    isPublic: true,
                    filters:
                        ['custentity_lf_school_record', 'is', schoolId],
                    columns:
                        [
                            search.createColumn({
                                name: "entityid",
                                sort: search.Sort.ASC,
                                label: "Name"
                            })

                        ]
                });

                var assemblyItemSearch = search.create({
                    type: search.Type.ASSEMBLY_ITEM,
                    title: 'custsearch_' + anotherValue,
                    id: 'customsearch_assembly_' + uniqueID,
                    isPublic: true,
                    filters: [
                        ["type", "anyof", "Assembly"],
                        "AND",
                        ["isinactive", "any", ""],
                        "AND",
                        ['custitem_lf_school', 'is', schoolId],
                        "AND",
                        ['custitem_lf_school_name', 'is', schoolName],
                    ],
                    columns:
                        [
                            search.createColumn({
                                name: "itemid",
                                sort: search.Sort.ASC,
                                label: "Name"
                            })
                        ]
                })

                var inventoryItemsSearch = search.create({
                    type: search.Type.INVENTORY_ITEM,
                    title: 'custsearch_' + anotherValue,
                    id: 'customsearch_inventoryItem_' + uniqueID,
                    isPublic: true,
                    filters: [
                        ["type","anyof","InvtPart"],
                        "AND",
                        ["custitem_lf_embellishment","is","T"],
                        "AND",
                        ["isinactive","is","F"],
                        "AND",
                        ["custitem_lf_school_name","anyof", schoolName],
                        "OR",
                        ["custitem_lf_school","anyof", schoolId]
                    ],
                    columns:
                        [
                            search.createColumn({
                                name: "itemid",
                                sort: search.Sort.ASC,
                                label: "Name"
                            })
                        ]
                })


                customSearch.run().each(function (result) {
                    // .run().each has a limit of 4,000 results
                    array1.push(result);

                    return true;
                });

                assemblyItemSearch.run().each(function (result) {

                    array2.push(result);

                    return true;
                })

                inventoryItemsSearch.run().each(function (result) {

                    array3.push(result);

                    return true;
                })


                return [...array1, ...array2, ...array3]



            } catch (e) {
                log.debug("Error", e)
            }

        }

        /**
         * Defines the function that is executed when the map entry point is triggered. This entry point is triggered automatically
         * when the associated getInputData stage is complete. This function is applied to each key-value pair in the provided
         * context.
         * @param {Object} mapContext - Data collection containing the key-value pairs to process in the map stage. This parameter
         *     is provided automatically based on the results of the getInputData stage.
         * @param {Iterator} mapContext.errors - Serialized errors that were thrown during previous attempts to execute the map
         *     function on the current key-value pair
         * @param {number} mapContext.executionNo - Number of times the map function has been executed on the current key-value
         *     pair
         * @param {boolean} mapContext.isRestarted - Indicates whether the current invocation of this function is the first
         *     invocation (if true, the current invocation is not the first invocation and this function has been restarted)
         * @param {string} mapContext.key - Key to be processed during the map stage
         * @param {string} mapContext.value - Value to be processed during the map stage
         * @since 2015.2
         */

        const map = (mapContext) => {

            try {

                var script = runtime.getCurrentScript();
                var standardRoy = script.getParameter({name: 'custscript_school_std_roy_perc'})
                var headwearRoy = script.getParameter({name: 'custscript_lf_school_hdwr_roy_perc'})
                var specialRoy = script.getParameter({name: 'custscript_lf_school_spec_roy_perc'})

                var listID = JSON.parse(mapContext.value)

                log.debug(listID.recordType, "This is the invetory item id" + listID.id)


               if(listID.recordType === "customer" ){

                        var id = record.submitFields({
                            type: record.Type.CUSTOMER,
                            id: listID.id,
                            values: {
                                'custentity_lf_std_roy_rate_new' : standardRoy,
                                'custentity_lf_hdwr_roy_new': headwearRoy,
                                'custentity_lf_spec_roy_rate_new': specialRoy,
                                'custentity_lf_acc_royalty_percent': standardRoy,
                                'custentity_lf_headwear_royalty_percent': headwearRoy
                            }
                        });
                        log.debug("Record", "This record was updated: " + id)

                    }


                if(listID.recordType === "assemblyitem"){
                    var id = record.submitFields({
                        type: record.Type.ASSEMBLY_ITEM,
                        id: listID.id,
                        values: {
                            'custitem_lf_std_roy_rate' : standardRoy,
                            'custitem_lf_hdwr_roy_new': headwearRoy,
                            'custitem_lf_spec_roy_rate_new': specialRoy,
                            'custitemlf_headwear_rate': headwearRoy,
                            'custitem_lf_royalty_rate': standardRoy,

                        }
                    });
                    log.debug("Record", "This record was updated: " + id)

                }

                if(listID.recordType === "inventoryitem"){

                    var id = record.submitFields({
                        type: record.Type.INVENTORY_ITEM,
                        id: listID.id,
                        values: {
                            'custitem_lf_royalty_rate': standardRoy,
                            'custitemlf_headwear_rate': headwearRoy,
                            'custitem_lf_std_roy_rate': standardRoy,
                            'custitem_lf_hdwr_roy_new': headwearRoy,
                            'custitem_lf_spec_roy_rate_new': specialRoy
                            }
                        });
                    log.debug("Record", "This record was updated: " + id)

                    //     const inventoryRecord = record.load({
                    //         type: record.Type.INVENTORY_ITEM,
                    //         id: listID.id
                    //     })
                    //
                    //    var hwr =   inventoryRecord.getValue({
                    //       fieldId: 'custitem_lf_hdwr_roy_new'
                    //     })
                    //     log.debug("Headwear value Old", hwr)
                    //
                    //     inventoryRecord.setValue({
                    //         fieldId: 'custitem_lf_hdwr_roy_new',
                    //         value: headwearRoy
                    //     })
                    //
                    //     inventoryRecord.save()
                    //
                    //     var hwr2 = inventoryRecord.getValue({
                    //         fieldId: 'custitem_lf_hdwr_roy_new'
                    //     })
                    // log.debug("Headwear value New", hwr2)




                }




            } catch (e) {
                log.debug("Error Message:", e)
            }


        }

        /**
         * Defines the function that is executed when the reduce entry point is triggered. This entry point is triggered
         * automatically when the associated map stage is complete. This function is applied to each group in the provided context.
         * @param {Object} reduceContext - Data collection containing the groups to process in the reduce stage. This parameter is
         *     provided automatically based on the results of the map stage.
         * @param {Iterator} reduceContext.errors - Serialized errors that were thrown during previous attempts to execute the
         *     reduce function on the current group
         * @param {number} reduceContext.executionNo - Number of times the reduce function has been executed on the current group
         * @param {boolean} reduceContext.isRestarted - Indicates whether the current invocation of this function is the first
         *     invocation (if true, the current invocation is not the first invocation and this function has been restarted)
         * @param {string} reduceContext.key - Key to be processed during the reduce stage
         * @param {List<String>} reduceContext.values - All values associated with a unique key that was passed to the reduce stage
         *     for processing
         * @since 2015.2
         */
        const reduce = (reduceContext) => {


        }


        /**
         * Defines the function that is executed when the summarize entry point is triggered. This entry point is triggered
         * automatically when the associated reduce stage is complete. This function is applied to the entire result set.
         * @param {Object} summaryContext - Statistics about the execution of a map/reduce script
         * @param {number} summaryContext.concurrency - Maximum concurrency number when executing parallel tasks for the map/reduce
         *     script
         * @param {Date} summaryContext.dateCreated - The date and time when the map/reduce script began running
         * @param {boolean} summaryContext.isRestarted - Indicates whether the current invocation of this function is the first
         *     invocation (if true, the current invocation is not the first invocation and this function has been restarted)
         * @param {Iterator} summaryContext.output - Serialized keys and values that were saved as output during the reduce stage
         * @param {number} summaryContext.seconds - Total seconds elapsed when running the map/reduce script
         * @param {number} summaryContext.usage - Total number of governance usage units consumed when running the map/reduce
         *     script
         * @param {number} summaryContext.yields - Total number of yields when running the map/reduce script
         * @param {Object} summaryContext.inputSummary - Statistics about the input stage
         * @param {Object} summaryContext.mapSummary - Statistics about the map stage
         * @param {Object} summaryContext.reduceSummary - Statistics about the reduce stage
         * @since 2015.2
         */
        const summarize = (summaryContext) => {

            var type = summaryContext.toString();

            log.audit(type + ' Usage Consumed', summaryContext.usage);
            log.audit(type + ' Number of Yields', summaryContext.yields);



        }

        return {getInputData, map, reduce, summarize}

    });
