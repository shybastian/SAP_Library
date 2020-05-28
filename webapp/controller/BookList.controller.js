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
                var oModel = new sap.ui.model.json.JSONModel();
                this.newBookDialog.setModel(oModel);
                this.newBookDialog.getModel().setData(this.book);
            } else {
                this.newBookDialog.open();
            }        
        },

        onUpdateBook(oEvent){
            const aSelContext = this.byId("idBooksTable").getSelectedContexts();
            if (aSelContext.length != 0){
                const oBook = aSelContext[0].getObject();
                if(!this.updateBookDialog){
                    this.updateBookDialog = sap.ui.xmlfragment("org.ubb.books.view.fragment.update",this);
                    var oModel = new sap.ui.model.json.JSONModel();
                    this.updateBookDialog.setModel(oModel);
                    this.updateBookDialog.getModel().setData(oBook);
                    console.log(oBook);
                    console.log("This is the data");
                    console.log(oBook.DatePublished);
                    const date = oBook.DatePublished;
                    console.log(splitDate);
                } else {
                    this.updateBookDialog.open();
                }
            } else {
                MessageToast.show("Select a Book to update it!");
            }
        },
    
        saveBook(oEvent){
            if (this.book.TotalNumber < this.book.AvailableNumber){
                MessageToast.show("Total Number must be greater than Available Number!");
            } else {
                var dateString = this.book.DatePublished;
                var dateFormat = sap.ui.core.format.DateFormat.getDateInstance({pattern : "dd/MM/yyyy" });
                var TZOffsetMs = new Date(0).getTimezoneOffset()*60*1000;
                var parsedDate = new Date(dateFormat.parse(dateString).getTime() - TZOffsetMs).getTime();
                this.book.DatePublished ="\/Date(" + parsedDate + ")\/";
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
            if (this.book.TotalNumber < this.book.AvailableNumber){
                MessageToast.show()
            }
        },

        closeDialog(oEvent){
            this.newBookDialog.close();
        }
    });
});