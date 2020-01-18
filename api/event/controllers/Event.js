

module.exports = {

    search : async ctx =>{
        const data = ctx.request.body;
         const entry = await Event.find({
            $or: [
                    {"event_name": { "$regex": data.searchTerm }},
                    {"description": { "$regex": data.searchTerm }},
                ],
            })
        return ctx.send(entry)
    },






    eventsfollowed : async ctx =>{
        const data = ctx.request.body;
        var newArr = [];
        console.log(data)
        const entry = await Eventfollows
         .find({
             "user" : data.user,
             "event": { $ne: null } 
         })
         if(data.start_date1 &&data.start_date2){
            for(let x=0;x<entry.length;x++){
                entry[x] = await Event.findOne({
                    _id : entry[x].event,
                    "is_approved" : "approved",
                    start_date: {$gte:data.start_date1 ,$lt: data.start_date2 }
                })
                .populate('user eventtags eventattendees eventfollows')
                
                if(entry[x] != null){
                    newArr.push(entry[x])
                }
            }
        }else{
            if(data.start_date1){
                for(let x=0;x<entry.length;x++){
                 entry[x] = await Event.findOne({
                        _id : entry[x].event,
                        "is_approved" : "approved",
                        start_date: {$gte:data.start_date1}
                    }).populate('user eventtags eventattendees eventfollows')
                    
                    if(entry[x] != null){
                        newArr.push(entry[x])
                    }
                }
            }else{
            for(let x=0;x<entry.length;x++){
                entry[x] = await Event.findOne({
                    _id : entry[x].event,
                    "is_approved" : "approved",
                }).populate('user eventtags eventattendees eventfollows')
                if(entry[x] != null){
                    newArr.push(entry[x])
                }
             }
                 
         }
        }
        var anotherArr = newArr.reduce((unique, o) => {
            if(!unique.some(obj => obj.id === o.id && obj.value === o.value)) {
              unique.push(o);
            }
            return unique;
        },[]);
        return ctx.send(anotherArr)
    },


    eventsinterested : async ctx =>{
        const data = ctx.request.body;
        var entry = [];
        const tags = [];
        console.log(data)
  
 
        const userx = await User.findOne({
            _id : data.user
        }).populate('userfollows userattendees events')
        let grossEvents = [];

        userx.userfollows.forEach(foll => {
                grossEvents.push(foll.event)
        });

        userx.userattendees.forEach(att => {
            grossEvents.push(att.event)
        });

        userx.events.forEach(evv => {
            grossEvents.push(evv._id)
        });
        const netEvents = grossEvents;
        var grossTags = []
            for(let x=0;x<netEvents.length;x++){
                var temp =  await Eventtag.find({
                    event : netEvents[x],
                })
                if(temp.length){
                    for(let y=0;y<temp.length;y++){
                            grossTags.push(temp[y])
                    }
                }
            }
        const netTags = grossTags;
        var allForNetTags = []
        for(let x=0;x<netTags.length;x++){
            var tempx =  await Eventtag.find({
                has_tag_name : netTags[x].has_tag_name,
            })
            if(tempx.length){
                for(let yo=0;yo<tempx.length;yo++){
                    allForNetTags.push(tempx[yo])
                }
            }
        }        
        var eventForAllTags = []
        for(let x=0;x<allForNetTags.length;x++){

            var tempxy =  await Event.find({
                _id : allForNetTags[x].event,
            })
            if(tempxy.length){
                for(let xo=0;xo<tempxy.length;xo++){
                    eventForAllTags.push(tempxy[xo])
                }
            }
        }        
        var uniqeventForAllTags = eventForAllTags.reduce((unique, o) => {
            if(!unique.some(obj => obj.id === o.id && obj.value === o.value)) {
              unique.push(o);
            }
            return unique;
        },[]);
        return ctx.send(uniqeventForAllTags)
    },



    // imagedelete : async ctx =>{
    //     const data = ctx.request.body;
    //     const event = await Event.findById(data.eventId)
    //     const images = data.images;

    //     if(event.attachments.length){
    //         const attachments =  event.attachments;
    //         // var filteredArray = [];



    //         images.forEach(im => {
    //             attachments.forEach(async (att,ind) => {
    //                     if(im == att._id){
    //                         console.log(im,att.url)



 


    //                         // fs.unlink("http://localhost:1338/uploads/test.png", function(error) {
    //                         //     if (error) {
    //                         //         console.log(error);
    //                         //     }
    //                         //     console.log('Deleted',att.name);
    //                         // });

    //                     }                    
    //             });
                
    //         });




    //         return ctx.send("filteredArray")

    //     }else{
    //         return ctx.send("No attachments to this event found")
    //     }
    // },






    eventsbyme : async ctx =>{
        const data = ctx.request.body;

        if(data.start_date1&&data.start_date2){
        const entry = await Event.find({
                "user": data.user, 
                "start_date": {
                    "$gte":
                    data.start_date1 ,
                    "$lt": 
                    data.start_date2 
                }
            },
            {skip : data.startFrom},
            {limit : data.pmargin}
            ).populate('user eventtags eventattendees eventfollows')

            return ctx.send(entry)


        }else{
            if(data.start_date1){

                const entry = await Event.find({
                    "user": data.user, 
                    "start_date": {
                        "$gte":
                        data.start_date1 ,
                    }
                },
                {skip : data.startFrom},
                {limit : data.pmargin}
                ).populate('user eventtags eventattendees eventfollows')
    
                return ctx.send(entry)

            }else{
                const entry = await Event.find({
                    "user": data.user, 
                },
                {skip : data.startFrom},
                {limit : data.pmargin}
                ).populate('user eventtags eventattendees eventfollows')

                return ctx.send(entry)


            }

        }
    },




eventsdatewise: async ctx =>{
    const data = ctx.request.body;
    const entry = await Event.find({

                    "start_date": {
                        "$gte":
                        data.start_date1 ,
                        "$lt": 
                        data.start_date2 
                    }
        }).populate('user eventtags eventattendees eventfollows')
        return ctx.send(entry)
},

eventsbyfollowstatus : async ctx =>{
    const data = ctx.request.body;
    const newArr = [];
    const entry = await Event.find({
        "is_approved" : "approved",
    })


    

    // for(let x=0;x<entry.length;x++){
    //         entry[x].isfollowing="teting";
    //         newArr.push(entry[x])
    //  }



    return ctx.send(newArr)
},

eventTrending : async ctx =>{
    var previosDate = new Date();
    previosDate.setDate(previosDate.getDate() - 10);
    let tempEvents = [];
    const events  = await Event.find({
        "is_approved" : "approved",
        start_date: {$gte: previosDate ,$lt: Date.now() }
    }).populate('eventattendees eventfollows')
    events.forEach(ev=>{
        tempEvents.push({
            _id : ev._id,
            name : ev.event_name,
            follows : ev.eventfollows.length,
            attendees : ev.eventattendees.length
        })
    })
    tempEvents.sort(function(b, a){
        return a.follows-b.follows
    })
    let  newArr = [];
    for(let x=0;x<tempEvents.length;x++){
        tempEvents[x] = await Event.findOne({
            _id : tempEvents[x]._id,
        }).populate('user eventtags eventattendees eventfollows')
        newArr.push(tempEvents[x])
    }
    // tempEvents.sort(function(b, a){
    //     return a.attendees-b.attendees
    // })
    return ctx.send(newArr)
}


}
