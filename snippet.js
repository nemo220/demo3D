$(document).ready(function () {

    // setup multiple input widget

    jQuery('#allocation-items').multipleInput({
        "id": "allocation-items",
        "inputId": "dynamicmodel-items",
        "template": `<tr class="multiple-input-list__item">
      <td class="list-cell__type">
          <div class="field-dynamicmodel-items-{multiple_index_allocation-items}-type form-group"><input type="text"
                  id="dynamicmodel-items-{multiple_index_allocation-items}-type"
                  class="product-name-input-el form-control"
                  name="DynamicModel[items][{multiple_index_allocation-items}][type]" readonly="readonly"></div>
      </td>
      <td class="list-cell__product_label">
          <div class="field-dynamicmodel-items-{multiple_index_allocation-items}-product_label form-group"><input
                  type="text" id="dynamicmodel-items-{multiple_index_allocation-items}-product_label" class="form-control"
                  name="DynamicModel[items][{multiple_index_allocation-items}][product_label]" readonly="readonly"></div>
      </td>
      <td class="list-cell__name">
          <div class="field-dynamicmodel-items-{multiple_index_allocation-items}-name form-group"><input type="text"
                  id="dynamicmodel-items-{multiple_index_allocation-items}-name"
                  class="product-name-input-el form-control"
                  name="DynamicModel[items][{multiple_index_allocation-items}][name]" readonly="readonly"></div>
      </td>
      <td class="list-cell__button">
          <div class="multiple-input-list__btn js-input-remove btn btn-danger"><i class="fa fa-times"></i></div>
      </td>
  </tr>`,
        jsTemplates: {},
        "max": 9223372036854775807,
        "min": 1,
        "attributes": {
            "dynamicmodel-items-type": [],
            "dynamicmodel-items-product_label": [],
            "dynamicmodel-items-name": [],
        },
        "indexPlaceholder": "multiple_index_allocation-items",
        "prepend": false
    });

    // add hooks to manipulate the 3D map

    $(".allocation-form tfoot td:not(.list-cell__button)").attr("colspan", "5");

    // allocation form create/update, master plan
    let multipleInputEl = document.querySelector("#allocation-items.multiple-input");
    let masterPlan;
    let lastAppliedSelection;
    let markedDistributionCount = {};
    let types = { 12: 1, 11: 1, 2: 1, 3: 1, 5: 1 };
    let wings = [{ 'block': 'Zone 1', 'wing': 'S' }, { 'block': 'Zone 1', 'wing': 'U' }, { 'block': 'Zone 1', 'wing': 'V' }, { 'block': 'Zone 1', 'wing': 'F' }];
    let helpBlock = $('form#Allocation .help-block').first();

    let helpMessage = "";
    if (wings)
        helpMessage += ("Allowed Wings: " + wings.map((x) => x.block + " Block " + x.wing).join(", ") + "<br>");
    helpMessage += "Allowed Product Types: " + Object.keys(types).map((x) => typeToStirng(parseInt(x))).join(", ");

    helpBlock.html(helpMessage);

    $('form#Allocation').on('submit', function (e) {
        let bool = isValid();
        if (bool) {
            e.preventDefault();
            window.alert("Input Received");
            return false;
        }
        return bool;
    });

    function isValid() {
        let errorMessage = "";

        // for (let typeId in types) {
        //     if (markedDistributionCount[typeId] != types[typeId])
        //         errorMessage += ("Exactly " + types[typeId] + " items of type " + typeToStirng(parseInt(typeId)) + " must be specified <br>");
        // }

        for (let typeId in markedDistributionCount)
            if (!types.hasOwnProperty("" + typeId))
                errorMessage += ("Invalid product types selected (" + typeToStirng(parseInt(typeId)) + ")")

        if (errorMessage.length > 0) {
            helpBlock.html(helpMessage + "<br><br>" + errorMessage);
            return false;
        } else

            helpBlock.html(helpMessage);

        return true;

    }

    function typeToStirng(type) {
        switch (type) {
            case 12:
                /* ShopTypes.ABETE */
                return "abete";
            case 11:
                /* ShopTypes.ATIPA */
                return "atipa";
            case 2:
                /* ShopTypes.PREMIUM */
                return "premium";
            case 3:
                /* ShopTypes.DELUXE */
                return "deluxe";
            case 5:
                /* ShopTypes.SUPERIOR */
                return "superior";
            case 7:
                /* ShopTypes.STANDARD_PLUS_SHOP */
                return "standard plus shop";
            case 8:
                /* ShopTypes.STANDARD_SHOP */
                return "standard shop";
            case 9:
                /* ShopTypes.STALL */
                return "stall";
            case 16:
                /* ShopTypes._2SQM */
                return "2sqm";
            case 15:
                /* ShopTypes._3SQM */
                return "3sqm";
            case 14:
                /* ShopTypes._3_POINT_6SQM */
                return "3.6sqm";
            case 18:
                /* ShopTypes._1_POINT_8SQM */
                return "1.8sqm";
            case 17:
                /* ShopTypes._1SQM */
                return "1sqm";
        }
        return null;
    }

    function addRow(shopUnit, firstRow) {

        if (firstRow == true) {

            let firstRow2 = $(multipleInputEl.querySelector("tr.multiple-input-list__item:first-child"));

            firstRow2.find("td.list-cell__type input").val(typeToStirng(shopUnit.type_id.id));
            firstRow2.find("td.list-cell__product_label input").val(shopUnit.number);
            firstRow2.find("td.list-cell__name input").val(shopUnit.name);

        } else
            $(multipleInputEl).multipleInput('add', {
                type: typeToStirng(shopUnit.type_id.id),
                product_label: shopUnit.number,
                name: shopUnit.name,
            });
    }

    function nodeListToArray(nodeList) {
        let arr = [];
        nodeList.forEach(function (x) {
            arr.push(x);
        });
        return arr;
    }



    $(multipleInputEl).on('beforeDeleteRow', function (_, row) {
        masterPlan.centralHook.unregisterInputEl(row[0].querySelector("td.list-cell__name input"));
        masterPlan.centralHook.unregisterInputEl(row[0].querySelector("td.list-cell__product_label input"));
        let shopUnit = $(row[0].querySelector("td.list-cell__product_label input")).val();
        if (shopUnit) {
            // in the last selection, this shopUnit is Still selected
            if (lastAppliedSelection && lastAppliedSelection.filter((x) => x.number == shopUnit).length > 0)
                return;
            masterPlan.centralHook.deselectShopUnit({
                number: shopUnit
            });
        }
    });

    $(multipleInputEl).on('afterAddRow', function (_, row) {
        row[0].querySelectorAll("td.list-cell__name input, td.list-cell__product_label input").forEach((x) => masterPlan.centralHook.registerInputEl(x));
    });

    function applySelection(arr) {
        arr = arr.sort((x) => x.type_id.id);
        let group = _.groupBy(arr, (x) => x.type_id.id);
        let newArr = [];

        lastAppliedSelection = arr;
        //  ignore those already installed
        //  add rows to compensate for whats left
        let rows = multipleInputEl.querySelectorAll("tr.multiple-input-list__item:not(:first-child)");
        // let currentItems = $(multipleInputEl).find("tr.multiple-input-list__item td.list-cell__product_label input").map((i, x) => $(x).val()).toArray();
        let currentItems = [];

        let firstShopUnit = $(multipleInputEl.querySelector("tr.multiple-input-list__item:first-child td.list-cell__product_label input")).val();
        if (firstShopUnit.trim().length == 0) {

            // user removed this item
            if (arr.filter((x) => firstShopUnit.indexOf(x.number) !== -1).length === 0) {
                // clear first row

                let firstRow = $(multipleInputEl.querySelector("tr.multiple-input-list__item:first-child"));

                firstRow.find("td.list-cell__type input").val("");
                firstRow.find("td.list-cell__product_label input").val("");
                firstRow.find("td.list-cell__name input").val("");

                currentItems.push(arr[0].number);
                addRow(arr[0], true);

            } else

                currentItems.push(firstShopUnit);

        } else {
            currentItems.push(arr[0].number);
            addRow(arr[0], true);
        }

        for (let i = 0; i < rows.length; i++) {
            let shopUnit = $(rows[i].querySelector("td.list-cell__product_label input")).val();

            if (!shopUnit) {
                $(multipleInputEl).multipleInput('remove', nodeListToArray(multipleInputEl.querySelectorAll("tr.multiple-input-list__item:not(:first-child)")).indexOf(rows[i]));
                continue;
            }

            let rowItemProductNumber = shopUnit;

            // this item is already included up, skip and remove this row
            if (currentItems.filter((x) => x.indexOf(rowItemProductNumber) !== -1).length > 0) {
                $(multipleInputEl).multipleInput('remove', nodeListToArray(multipleInputEl.querySelectorAll("tr.multiple-input-list__item:not(:first-child)")).indexOf(rows[i]));
                continue;
            }
            currentItems.push(rowItemProductNumber);

            // user removed this item
            if (arr.filter((x) => x.number === rowItemProductNumber).length === 0) {
                $(multipleInputEl).multipleInput('remove', nodeListToArray(multipleInputEl.querySelectorAll("tr.multiple-input-list__item:not(:first-child)")).indexOf(rows[i]));
            }
        }

        let itemsToAdd = arr.filter((x) => currentItems.indexOf(x.number) === -1);
        itemsToAdd.forEach((x) => addRow(x, false));

        markedDistributionCount = {};
        for (let x in group)
            markedDistributionCount["" + x] = group[x].length;
        lastAppliedSelection = null;
    }

    installPureLibrary(true);

    masterPlan = createMasterPlan({
        overlay: true,

        availableShopTypesForSelection: Object.keys(types).map((x) => parseInt(x)),
        // availableWings: wings,

        preserveSelectionsAcrossMalls: true,
        mode: "allocation",
        demoMode: true,
        inputElement: ".product-name-input-el, .product-number-input-el",
        applySelection: applySelection
    });



});