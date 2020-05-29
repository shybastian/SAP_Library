sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageToast",
    "sap/ui/core/Fragment"
], function (Controller, MessageToast, Fragment) {
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

        onDeleteBook(oEvent){
            const aSelContexts = this.byId("idBooksTable").getSelectedContexts();
            const sBookPath = aSelContexts[0].getPath();
            this.getView().getModel().remove(sBookPath);
        },

        onInsertBook(oEvent){
            if(!this.newBookDialog){
                this.newBookDialog = sap.ui.xmlfragment("org.ubb.books.view.fragment.insert",this);
            }
            this.resetBook();
            var oModel = new sap.ui.model.json.JSONModel();
            this.newBookDialog.setModel(oModel);
            this.newBookDialog.getModel().setData(this.book);
            this.newBookDialog.open();
        },

        onUpdateBook(oEvent){
            const aSelContext = this.byId("idBooksTable").getSelectedContexts();
            if (aSelContext.length != 0){
                var oBook = aSelContext[0].getObject();
                oBook = this.parseDatePublishedForUpdate(oBook);
                this.book = oBook;
                if(!this.updateBookDialog){
                    this.updateBookDialog = sap.ui.xmlfragment("org.ubb.books.view.fragment.update",this);
                }
                var oModel = new sap.ui.model.json.JSONModel();
                this.updateBookDialog.setModel(oModel);
                this.updateBookDialog.getModel().setData(this.book);
                this.updateBookDialog.open();
            } else {
                MessageToast.show("Select a Book to update it!");
            }
        },

        parseDatePublishedForCreate(oBook){
            var dateString = oBook.DatePublished;
            var dateFormat = sap.ui.core.format.DateFormat.getDateInstance({pattern : "dd/MM/yyyy" });
            var TZOffsetMs = new Date(0).getTimezoneOffset()*60*1000;
            var parsedDate = new Date(dateFormat.parse(dateString).getTime() - TZOffsetMs).getTime();
            oBook.DatePublished ="\/Date(" + parsedDate + ")\/";
            return oBook;
        },

        parseDatePublishedForUpdate(oBook){
            var dateFormat = sap.ui.core.format.DateFormat.getDateInstance({pattern : "dd/MM/yyyy" }); 
            var date = new Date(oBook.DatePublished);
            var dateStr = dateFormat.format(date);
            oBook.DatePublished = dateStr;
            // oBook = this.parseDatePublishedForCreate(oBook);
            return oBook;
        },
    
        saveBook(oEvent){
            if (this.book.TotalNumber < this.book.AvailableNumber){
                MessageToast.show("Total Number must be greater than Available Number!");
            } else {
                this.book = this.parseDatePublishedForCreate(this.book);
                var oModel = this.getView().getModel();
                oModel.create('/Books', this.book, {
                    success: function() {
                        MessageToast.show("Book added!");
                    },
                    error: function(){
                        MessageToast.show("There was an error.");
                    }
                });
                this.newBookDialog.close();
            }
        },

        updateBook(oEvent){
            debugger;
            if (this.book.TotalNumber < this.book.AvailableNumber){
                MessageToast.show("Total No. of Books must be greater than Available No. of Books!");
            } else {
                this.book = this.parseDatePublishedForCreate(this.book);
                const aSelContexts = this.byId("idBooksTable").getSelectedContexts();
                const sBookPath = aSelContexts[0].getPath();
                var oModel = this.getView().getModel();
                oModel.update(sBookPath, this.book, {
                    success: function() {
                        MessageToast.show("Book updated!");
                    },
                    error: function(){
                        MessageToast.show("There was an error.");
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
        }
    });
});