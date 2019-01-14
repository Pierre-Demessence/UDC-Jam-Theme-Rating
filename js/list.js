let table = $('table').DataTable({
    columns: [
        {title: "Select"},
        {title: "ID", data: 'id'},
        {title: "Theme", data: 'themeName', render: $.fn.dataTable.render.text()},
        {title: "Score", data: 'score'},
        {title: "Ratings", data: 'nbRatings'},
        {title: "PositiveRatings", data: 'ratingPositive'},
        {title: "NegativeRatings", data: 'ratingNegative'},
        {title: "Weight", data: 'weight', render: $.fn.dataTable.render.number(',', '.', 1,)},
        {title: "Chances", data: 'chances', render: $.fn.dataTable.render.number(',', '.', 4, '', '%')},
        {title: "Stack Chances", data: 'stackedChances', render: $.fn.dataTable.render.number(',', '.', 4,)},
    ],

    order: [[4, "desc"]],
    stateSave: true,
    fixedHeader: true,
    lengthMenu: [[10, 25, 50, 100, -1], [10, 25, 50, 100, "All"]],
    pagingType: "full_numbers",
    columnDefs: [
        {
            orderable: false,
            className: 'select-checkbox',
            targets: 0,
            render: () => "",
            title: "Select"
        },
        {
            targets: 1,
            searchable: false,
        },
        {
            targets: [1, 5, 6, 7, 8, 9],
            visible: false,
        }
    ],
    colReorder: true,
    buttons: [
        {
            extend: 'copy',
            exportOptions: {
                columns: ":visible:not(:eq(0))"
            }
        },
        {
            extend: 'csv',
            exportOptions: {
                columns: ":visible:not(:eq(0))"
            }
        },
        {
            extend: 'pdf',
            exportOptions: {
                columns: ":visible:not(:eq(0))"
            }
        },
        {
            extend: 'print',
            autoPrint: false,
            exportOptions: {
                columns: ":visible:not(:eq(0))"
            }
        },
        'colvis'
    ],
    select: {
        style: 'multi+shift',
        selector: 'td:first-child'
    },
    footerCallback: function (row, data, start, end, display) {
        var api = this.api(), data;

        // Remove the formatting to get integer data for summation
        var intVal = function (i) {
            return typeof i === 'string' ?
                i.replace(/[\$,]/g, '') * 1 :
                typeof i === 'number' ?
                    i : 0;
        };

        // Total over all pages
        total = api
            .column(4)
            .data()
            .reduce((a, b) => intVal(a) + intVal(b), 0);

        // Total over this page
        pageTotal = api
            .column(4, {page: 'current'})
            .data()
            .reduce((a, b) => intVal(a) + intVal(b), 0);

        // Update footer
        $(api.column(4).footer()).html(
            pageTotal + ' (' + total + '&nbsp;total)'
        );
    }
});

table.buttons().container().appendTo('#example_wrapper .col-md-6:eq(0)');

ThemesRef.on("value", function () {
    let data = _.map(Themes);

    table.clear().draw();
    table.rows.add(data); // Add new data
    table.columns.adjust().draw(); // Redraw the DataTable
});