import './HelpPage.css'
function HelpPage(){
    return(
        <>
          <div className='helphead'>
                <h4>Time Management Coach <span style={{color:"blue"}}>Logic</span></h4>
          </div>

    <div className="helpmain">
            <div className='helpImg'>
                 <img alt="helpImg" src="./help.avif" ></img>
            </div>
           <div className='quardant'>
                 <div className='impnoturg'>
                     <h5>Important & Not Urgent</h5>  
                     <p>This quadrant shows all important tasks that are <b>due this week</b>, meaning from today up to the next 7 days, based on their priority level.</p> 
                 </div>
                 <div className='impurg'>
                     <h5>Important & Urgent</h5>
                     <p>This quadrant includes tasks that are high priority and <b>due today</b>.For example, if you created a task last week and it is due today, it appears here.If you don't complete the task by today, it will appear as overdue the next day but still remain in this quadrant.</p>  
                 </div>
                 <div className='notimpnoturg'>
                     <h5>Not Important & Not Urgent</h5> 
                     <p>This quadrant shows all other tasks that are not urgent or important. <b>These tasks have more flexible deadlines and can be completed later</b>.</p>
                     
                 </div>
                 <div className='notimpurg'>
                     <h5>Not Important & Urgent</h5>
                     <p>This quadrant displays tasks that are <b>created today and also due today</b>, but have a normal or low priority.</p>  
                </div>
           </div>
    </div>
        </>
    )
}
export default HelpPage