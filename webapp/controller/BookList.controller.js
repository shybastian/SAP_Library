sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageToast",
    "sap/ui/core/Fragment",
    "sap/ui/model/resource/ResourceModel",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/ui/model/Sorter"
], function (Controller, MessageToast, Fragment, ResourceModel, Filter, FilterOperator, Sorter) {
   "use strict";
   return Controller.extend("org.ubb.books.controller.BookList", {

        onInit: function(){
            this.book = {
                ISBN : "",
                Title:"",
                Author:"",
                DatePublished: "",
                Language:"",
                TotalNumber:"",
                AvailableNumber: 0
            }
        },

        /*
        * This function is called when the users presses on the "Filter" Button.
        * It takes all the values from the input fields and pushes Filters to the Gateway Service
        */
        onSearchButtonPressed(oEvent){
            // Get the Data from the Inputs
            var isbn = this.byId("inputISBN").getValue();
            var title = this.byId("inputTitle").getValue();
            var author = this.byId("inputAuthor").getValue();
            var language = this.byId("inputLanguage").getValue();
            var dateStart = this.byId("inputDateStart").getValue();
            var dateEnd = this.byId("inputDateEnd").getValue();

            var aFilter = [];
            var oList = this.getView().byId("idBooksTable");
            var oBinding = oList.getBinding("items");

            // Push set filters
            if (isbn) {
                aFilter.push(new Filter("ISBN", FilterOperator.Contains, isbn))
            }
            if (author) {
                aFilter.push(new Filter("Author", FilterOperator.Contains, author));
            }
            if (title) {
                aFilter.push(new Filter("Title", FilterOperator.Contains, title));
            }
            if (dateStart && dateEnd) {
                var filter = new Filter("DatePublished", FilterOperator.BT, dateStart, dateEnd);
                aFilter.push(filter);
            } else {
                var oResourceBundle = this.getView().getModel("i18n").getResourceBundle();
                MessageToast.show(oResourceBundle.getText("dateStartOrDateEndNotSetError"));
            }
            if (language) {
                aFilter.push(new Filter("Language", FilterOperator.Contains, language));
            }
            oBinding.filter(aFilter);
        },

        /*
        * Opens the Fragment which displays the Sort Options
        */
        onSortButtonPressed(oEvent){
            this._oDialog = sap.ui.xmlfragment("org.ubb.books.view.fragment.sorter", this);
            this.getView().addDependent(this._oDialog);
            this._oDialog.open();
        },

        /*
        * Triggers when the confirm button on the Sort Fragment is pressed
        */
        onConfirmSort(oEvent){
            var oView = this.getView();
            var oTable = oView.byId("idBooksTable");
            var mParams = oEvent.getParameters();
            var oBinding = oTable.getBinding("items");

            // apply the sorter
            var aSorters = [];
            var sPath = mParams.sortItem.getKey();
            var bDescending = mParams.sortDescending;
            aSorters.push(new Sorter(sPath, bDescending));
            oBinding.sort(aSorters);
        },

        /*
        * Checks a book out.
        */
        onCheckoutBook(oEvent){
            var oResourceBundle = this.getView().getModel("i18n").getResourceBundle();
            const aSelContext = this.byId("idBooksTable").getSelectedContexts();
            if (!aSelContext.length == 0){
                MessageToast.show(oResourceBundle.getText("notYetImplemented"));
            } else {
                MessageToast.show(oResourceBundle.getText("noSelectionCheckoutError"));
            }
        },

        /*
        * Opens the Insert Fragment when the Insert Button is clicked
        */
        onInsertBook(oEvent){
            if(!this.newBookDialog){
                this.newBookDialog = sap.ui.xmlfragment("org.ubb.books.view.fragment.insert",this);
            }
            // Reset the book because it may have some set attributes, if an update was made before
            this.resetBook();
            // Set the JSON Model and open Fragment
            var oModel = new sap.ui.model.json.JSONModel();
            this.getView().addDependent(this.newBookDialog);
            this.newBookDialog.setModel(oModel);
            this.newBookDialog.getModel().setData(this.book);
            this.newBookDialog.open();
        },

        /*
        * Opens the Update Fragment when the Update Button is clicked
        */
        onUpdateBook(oEvent){
            var oResourceBundle = this.getView().getModel("i18n").getResourceBundle();
            const aSelContext = this.byId("idBooksTable").getSelectedContexts();
            if (aSelContext.length != 0){
                // Get the selected Book and fills the inputs of the fragment
                var oBook = aSelContext[0].getObject();
                oBook = this.parseDatePublishedForUpdate(oBook);
                this.book = oBook;
                if(!this.updateBookDialog){
                    this.updateBookDialog = sap.ui.xmlfragment("org.ubb.books.view.fragment.update",this);
                }
                // Set the JSON Model and open Fragment
                var oModel = new sap.ui.model.json.JSONModel();
                this.getView().addDependent(this.updateBookDialog);
                this.updateBookDialog.setModel(oModel);
                this.updateBookDialog.getModel().setData(this.book);
                this.updateBookDialog.open();
            } else {
                MessageToast.show(oResourceBundle.getText("noSelectionUpdateError"));
            }
        },

        /*
        * Deletes a selected Book
        */
        onDeleteBook(oEvent){
            var oResourceBundle = this.getView().getModel("i18n").getResourceBundle();
            const aSelContexts = this.byId("idBooksTable").getSelectedContexts();
            if (aSelContexts.length != 0){
                const sBookPath = aSelContexts[0].getPath();
                this.getView().getModel().remove(sBookPath);
            } else {
                MessageToast.show(oResourceBundle.getText("noSelectionDeleteError"));
            }
        },

        /*
        * Parse the date of the given book to a format that SAP can accept
        * @input: oBook, object which the function parses the date for
        * @return: oBook, with parsed date
        */
        parseDatePublishedForCreate(oBook){
            var dateString = oBook.DatePublished;
            var dateFormat = sap.ui.core.format.DateFormat.getDateInstance({pattern : "dd/MM/yyyy" });
            var TZOffsetMs = new Date(0).getTimezoneOffset()*60*1000;
            var parsedDate = new Date(dateFormat.parse(dateString).getTime() - TZOffsetMs).getTime();
            oBook.DatePublished ="\/Date(" + parsedDate + ")\/";
            return oBook;
        },

        /*
        * Parse the date of the given book to a format that the Front can accept.
        * This was implemented because the SAP system returned a long version of the date
        * @input: oBook, book object which the function parses the date for
        * @return: oBook, with parsed date
        */
        parseDatePublishedForUpdate(oBook){
            var dateFormat = sap.ui.core.format.DateFormat.getDateInstance({pattern : "dd/MM/yyyy" }); 
            var date = new Date(oBook.DatePublished);
            var dateStr = dateFormat.format(date);
            oBook.DatePublished = dateStr;
            // oBook = this.parseDatePublishedForCreate(oBook);
            return oBook;
        },
    
        /*
        * Triggers when the saveBook button on the Insert Fragment is pressed.
        */
        saveBook(oEvent){
            var oResourceBundle = this.getView().getModel("i18n").getResourceBundle();
            if (this.validateBook(this.book)){
                // Parse the date and insert
                this.book = this.parseDatePublishedForCreate(this.book);
                var oModel = this.getView().getModel();
                oModel.create('/Books', this.book, {
                    success: function() {
                        MessageToast.show(oResourceBundle.getText("saveSuccess"));
                    },
                    error: function(){
                        MessageToast.show(oResourceBundle.getText("saveError"));
                    }
                });
                this.newBookDialog.close();
            }
        },

        /*
        * Triggers when the updateBook button on the Update fragment is pressed.
        */
        updateBook(oEvent){
            var oResourceBundle = this.getView().getModel("i18n").getResourceBundle();
            if (this.validateBook(this.book)){
                // Get the Path of the selected book and update
                this.book = this.parseDatePublishedForCreate(this.book);
                const aSelContexts = this.byId("idBooksTable").getSelectedContexts();
                const sBookPath = aSelContexts[0].getPath();
                var oModel = this.getView().getModel();
                oModel.update(sBookPath, this.book, {
                    success: function() {
                        MessageToast.show(oResourceBundle.getText("updateSuccess"));
                    },
                    error: function(){
                        MessageToast.show(oResourceBundle.getText("updateError"));
                    }
                });
                this.updateBookDialog.close();
            }
        },

        closeDialog(oEvent){
            if (this.newBookDialog){
                this.newBookDialog.close();
            }
            if (this.updateBookDialog){
                this.updateBookDialog.close();
            }
        },

        resetBook(){
            this.book.ISBN = "";
            this.book.Title = "";
            this.book.Author = "";
            this.book.DatePublished = "";
            this.book.Language = "";
            this.book.TotalNumber = 0;
            this.book.AvailableNumber = 0;
        },

        /*
        * Validates the book. A message will be shown if the book is not valid
        * @input: oBook, object which needs to be validated
        * @return: true if oBook is valid, false otherwise
        */
        validateBook(oBook){
            var oResourceBundle = this.getView().getModel("i18n").getResourceBundle();
            if (oBook.ISBN.length === 0){
                MessageToast.show(oResourceBundle.getText("isbnEmptyError"));
                return false;
            }
            if (oBook.ISBN.length > 13){
                MessageToast.show(oResourceBundle.getText("isbnLongerThan13Error"));
                return false;
            }
            if (oBook.Title.length === 0){
                MessageToast.show(oResourceBundle.getText("titleEmptyError"));
                return false;
            }
            if (oBook.Author.length === 0){
                MessageToast.show(oResourceBundle.getText("authorEmptyError"));
                return false;
            }
            if (oBook.DatePublished.length === 0){
                MessageToast.show(oResourceBundle.getText("dateEmptyError"));
                return false;
            }
            if (oBook.Language.length === 0){
                MessageToast.show(oResourceBundle.getText("languageEmptyError"));
                return false;
            }
            if (parseInt(oBook.TotalNumber) < 0){
                MessageToast.show(oResourceBundle.getText("totalNumberNegativeError"));
                return false;
            }
            if (parseInt(oBook.AvailableNumber) < 0){
                MessageToast.show(oResourceBundle.getText("availableNumberNegativeError"));
                return false;
            }
            if (parseInt(oBook.TotalNumber) < parseInt(oBook.AvailableNumber)){
                MessageToast.show(oResourceBundle.getText("totalNumberError"));
                return false;
            }
            return true;
        }
    });
});