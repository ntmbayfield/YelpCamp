var express = require("express");
var router = express.Router();
var Campground = require("../models/campground");
var middleware = require("../middleware");
var geocoder = require("geocoder");

function escapeRegex(text){
    return text.replace(/[-[\]{}()*+?.,\\^$!#\s]/g, "\\$&");
    
}
//======================
//CAMPGROUND ROUTES
//======================
//INDEX CAMPGROUNDS - show all
router.get("/",function(req, res) {
    if(req.query.search){
        const regex = new RegExp(escapeRegex(req.query.search), 'gi');
        Campground.find({name: regex},function(error,allCampgrounds){
            if(error)
            {
                console.log(error);
                req.flash("error","Something went wrong");
                return res.redirect("back");
            }
            if(allCampgrounds.length < 1){
                req.flash("warning","No match for that query, please try again.");
                return res.redirect("back");
            }
            res.render("campgrounds/index",{campgrounds:allCampgrounds});
        });
    }else{
        Campground.find({},function(error,allCampgrounds){
            if(error)
            {
                console.log(error);
                req.flash("error","Something went wrong");
                return res.redirect("back");
            }
            res.render("campgrounds/index",{campgrounds:allCampgrounds});
        });
    }
});

//NEW CAMPGROUND - show form
router.get("/new",middleware.isLogged,function(req, res) {
        res.render("campgrounds/new");
});

//CREATE CAMPGROUND - add new campground
router.post("/",middleware.isLogged,function(req,res){
    var name = req.body.camp.name;
    var image = req.body.camp.image;
    var price = req.body.camp.price;
    req.body.camp.desc = req.sanitize(req.body.camp.desc);
    var desc = req.body.camp.desc;
    var author = {
        id: req.user._id,
        username: req.user.username
    };
    geocoder.geocode(req.body.camp.location, function(err,data){
         if(err){
             console.log(err);
             req.flash("error","Invalid location.");
             return res.redirect("back");
         }
         var lat = data.results[0].geometry.location.lat;
         var lng = data.results[0].geometry.location.lng;
         var location = data.results[0].formatted_address;
         var newCamp = {name: name, price: price,image: image, desc: desc, author: author, location: location, lat: lat, lng: lng};
         Campground.create(newCamp,function(error, camp){
            if(error){
                console.log(error);
                req.flash("error","Something went wrong");
                return res.redirect("back");
            }
            console.log(camp);
            req.flash("success","Campground created");
            res.redirect("/campgrounds");
         });
    });
});

//SHOW CAMPGROUND - show info of a certain campground
router.get("/:id",function(req, res) {
        Campground.findById(req.params.id).populate({path:"comments",sort:{"date":-1}}).exec(function(error, found){
                if(error)
                {
                   console.log(error);
                   req.flash("error","Something went wrong");
                   return res.redirect("back");
                }
                res.render("campgrounds/show",{camp: found});
        });
});

//EDIT CAMPGROUND - edit info of a certain campground
router.get("/:id/edit",middleware.checkCampOwner,function(req, res) {
    Campground.findById(req.params.id,function(error,found){
       if(error)
       {
           console.log(error);
           req.flash("error","Something went wrong");
           return res.redirect("/campgrounds/"+req.paras.id+"/edit");
       }
       res.render("campgrounds/edit",{camp:found});
    });
});

//UPDATE CAMPGROUND - update info of a certain campground
router.put("/:id",middleware.checkCampOwner,function(req,res){
    req.body.camp.desc = req.sanitize(req.body.camp.desc);
    geocoder.geocode(req.body.camp.location,function(err,data){
        if(err){
            console.log(err);
            req.flash("error","Invalid location.");
            return res.redirect("back");
        }
        var lat = data.results[0].geometry.location.lat;
        var lng = data.results[0].geometry.location.lng;
        var location = data.results[0].formatted_address;
        var newData = {name: req.body.camp.name, image: req.body.camp.image, desc: req.body.camp.desc, price: req.body.camp.price, location: location, lat: lat, lng: lng};
        Campground.findByIdAndUpdate(req.params.id,{$set: newData},function(error,updated){
            if(error)
            {
                console.log(error);
                req.flash("error","Something went wrong");
                return res.redirect("back");
            }
            req.flash("success","Campground updated.");
            res.redirect("/campgrounds/" + req.params.id);
        });
    });
});

//DELETE CAMPGROUND - delete info of a certain campground
router.delete("/:id",middleware.checkCampOwner,function(req,res){
    Campground.findByIdAndRemove(req.params.id,function(error){
       if(error)
       {
           console.log(error);
           req.flash("error","Something went wrong");
           return res.redirect("/campgrounds/"+req.params.id);
       }
       req.flash("success","Campground removed.");
       res.redirect("/campgrounds");
    });
});

module.exports = router;