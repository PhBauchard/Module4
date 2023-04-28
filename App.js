import React, { Component, useEffect, useState } from 'react';

const listGStyle =    {color: "lightgreen",backgroundColor: "black",
padding: "5px",fontFamily: "Calibri"};
const listStyle  = {color: "lightgreen",fontWeight: "bold",backgroundColor: "black", padding: "5px",fontFamily: "Calibri"};
const listWStyle = {color: "white",backgroundColor: "black",padding: "5px",fontFamily: "Calibri"};  
const imgStyle = {border: "0px solid #000", maxWidth:"150px", maxHeight:"150px"};
const tableStyle = {textAlign: "left", width: "100%", border:"0", backgroundColor: "White"};
const tdStyle = {verticalAlign: "top", textAlign: "left"};
const tdStyle2 = {verticalAlign: "top", textAlign: "right"};
// Component MakeItem
//
// ces entrées sont générées autant de fois que de stock disponible 
//
const MakeItem = function({X}) {
       return (<option style={listGStyle}>Réserver {X}</option>);
};
var msg="";

// Component BoxItem
const BoxItem = ({post, setPosts})=>{
    const lineStyle = {color: "black",backgroundColor: "White", padding: "5px", fontFamily: "Calibri"};

    useEffect(()=>{
      let is_mount = false;
      if(!is_mount){
      }
      return () => is_mount = true;

  }, [post]); // refresh component si change sur post

    // ------------------------------------------------------------------------------------
    const  updatestock2 =  (id,qty,booked) =>  { // mise à jour stock réservé et restant pour cet id
    // ------------------------------------------------------------------------------------
        // refresh page aprés mise à jour strapi
        let requestOptions = {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            "data":
            {
            "actual_stock": qty,
            "booked_stock": booked
            }
          })
        };
        let self=this;
        // console.log(requestOptions.body);
    
        fetch('http://192.168.0.22:1337/api/stock-produits-p/'+id+'?populate=*', requestOptions )
        .then(response => response.json())
        //.then(window.location.reload()); // refresh page
        // si l'id est celui qui a été changé, alors mise à jour du post.
        .then (json => setPosts(prevState => [...prevState.map(p=>p.id===post.id?json.data:p)]));
         
      }
    
    const handleChangeQty = (id,e,n,initbooked,prd,emailp,condi) => { // event handler gestion des qtés: e:réservé
      // n:total stock, initbooked: réservé origine
    msg="";
    let str= e.target.value+"";
    str = str.replace('Réserver ',''); // on retire la chaine
    if (isNaN(str)) return;
    let result = n-parseInt(str); // contient le stock restant
    let booked=parseInt(str)+initbooked; // contient la quantité totale réservée

    let str2=n+"";
    //        alert("Quantité réservée: "+str+" sur un total de "+n+".");
    updatestock2(id,result, booked);
    // alert("Merci. Votre réservation pour "+parseInt(str)+" produits ("+prd+") a bien été transmise au producteur, vous allez recevoir un lien par email (valable 10 mn) de sa part ("+emailp+") pour confirmer et payer votre commande.");
    msg="Merci. Votre réservation pour "+parseInt(str)+" produits ("+prd+") selon le conditionnement indiqué ("+condi+") a bien été transmise au producteur. Vous allez recevoir un lien par email (valable 10 mn) de sa part ("+emailp+") pour confirmer et payer votre commande.";
  }

    const selectline = (nb) => { // construction de la boite de réservation
        let genarray=[];
        genarray[1]="";
        for (let i = 1; i < nb+1; i++) {
            genarray[i+1]=i;
        }
        // alert(genarray);
        return genarray;
    }

    return (
        <div className="card">
            <div className="card-header">  
            <table style={tableStyle} >
              <td style={tdStyle}>             
              <h4 style={lineStyle}>

                <b> {post.attributes.nom_produit}</b>, Conditionnement: {post.attributes.description}
                 , <br></br>Quantité Disponible: <b>{post.attributes.actual_stock}</b> , Réservé:<b> {post.attributes.booked_stock} </b>
                <br></br>{post.attributes.email_producteur}<br></br>
                {post.attributes.actual_stock> 0 && // on n'affiche la boite réservation que si le stock est > 0
                  <select sx={listStyle}
                    onChange=
                    {(e) => handleChangeQty(post.id,e,post.attributes.actual_stock, post.attributes.booked_stock,post.attributes.nom_produit, post.attributes.email_producteur,post.attributes.description)}>
                    {selectline(post.attributes.actual_stock).map((v, x) => (<MakeItem X={v} key={post.id*x}/>))}
                  </select>
                }              
                
              </h4>
              </td>
              <td style={tdStyle2}>
              <img  className='image' src={'http://192.168.0.22:1337'+post.attributes?.image_produit?.data?.attributes?.formats?.thumbnail?.url} 
                style={imgStyle} ></img>
              </td>
              </table>

            </div>
       </div>
    )
}

// Component Select
const Filter = ({setSelectedValue})=>{

    const handleChange = (e) => { // filtre sur les categories affichées
        msg="";
        setSelectedValue(e.target.value);
    }
    
    return (
        
            <select style={listStyle} onChange={(e) => handleChange(e)}>
              <option style={listWStyle} value="*">Toutes catégories</option>
              <option style={listWStyle} value="*fruits">Fruits</option>
              <option style={listWStyle} value="*légumes">Légumes</option>
            </select>
        
    );
}

// Component body
const MainApp = ()=>{
    const [posts, setPosts] = useState([]);
    const [selectedValue, setSelectedValue] = useState("*");
    const titleStyle =   {color: "white",backgroundColor: "DodgerBlue",padding: "5px",fontFamily: "Calibri", textAlign: "right"};
    
  //  const btnStyle =     {color: "yellow",backgroundColor: "black",padding: "5px",fontFamily: "Calibri"};

    useEffect(()=>{
        let is_mount = false;
        if(!is_mount){
 
            const url = "http://192.168.0.22:1337/api/stock-produits-p?populate=*";
            fetch(url)
            .then(response => response.json())
            .then(json => setPosts(json.data))
            //    .then(        this.setState({selectedValue: "*"}))
        }

        return () => is_mount = true;

    }, []);


    const handleChange = (e) => { // filtre sur les categories affichées
        setSelectedValue(e.target.value);
    }


    return (
        <>
        <b>{msg}</b><br></br>
        <Filter setSelectedValue={setSelectedValue} />
 
        <div className="container">
          <div className="jumbotron">
            <h2 style={titleStyle} >Manger sain, état des stocks disponibles.</h2>
          </div>
          {
              posts.filter(post =>
                  ("*"+post.attributes.categorie).includes(selectedValue))
                        .map(post => (<BoxItem key={post.id} post={post} setPosts={setPosts}/>))
          }
          
          {/** posts.forEach(post => (console.log(post.attributes.categorie))) **/}
        </div>
      </> // fin

    )
}

class App extends Component {
  // ------------------------------------------------------------------------------------
  // ------------------------------------------------------------------------------------
  render() {        
    return ( // debut
        <MainApp />
      ); //return

  } //render

} // App
export default App;