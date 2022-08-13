import * as utils from '/Assets/Main/LydeLibrary.js';
const URL = urlApi+'/api/Modulo/27/Tema/1';
const ptID = $('#Pro_ID').val();
console.log(ptID);
$(document).ready( ()=>{
    inicial();
});
const inicial = () =>{
    listaBom(ptID);
    headerTabla(ptID);

    $('#btn-add').on('click',e =>{
        e.preventDefault();
        $('#buscador-productos').show();
    });

    $('#input-prodcuto').keypress(function (e) { 
        if(e.which == 13){
            $("#gridProductosBusqueda").html("");
            e.preventDefault();
            buscarProdcuto();
        }
    });

    $("#gridProductosBusqueda").on('click','.btn-primary', e =>{
        e.preventDefault();
        const proID = $(e.currentTarget).attr("data-proid");
        agregaraBom(proID);
     });



    $('#btn-Buscar').on('click', e =>{
        e.preventDefault();
        $("#gridProductosBusqueda").html("");
        buscarProdcuto();
    });

    $('.i-checks').iCheck({
        checkboxClass: 'icheckbox_square-green',
        radioClass: 'iradio_square-green',
    });
}

const headerTabla = async (bomProID) => {
    const response = await utils.More.dataFeching(URL,{Opcion:4,BOM_Pro_ID:bomProID});
    if (response.result == 1) {
        try {
            const tempHeader = $.trim($('#templateHeader').html());
            response.data.forEach(element =>{
                let clone = tempHeader.replace(/{{Nombre}}/ig,element.Pro_Descripcion);
                clone = clone.replace(/{{Descripcion}}/ig,element.Pro_Descripcion);
                clone = clone.replace(/{{SKU}}/ig,element.Pro_SKU);
                $('#tablaHeader').append(clone);
            });
        } catch (error) {
            //console.log(error);
        }
    }
}
const listaBom = async (pt_ID) =>{
    try {
        const response = await utils.More.dataFeching(URL,{Opcion:1,BOM_Pro_ID:pt_ID});
        if(response.result === 1){
            typeof response!=="undefined"? pintarGrid(response):error(response)
        }else{
         $("#listaProductos").html('<tr><td class="text-info text-center" colspan="5">El producto aun no cuenta con lista de productos.</td></tr>');
        }
    } catch (error) {
        $("#listaProductos").html(`<tr><td class="text-info text-center" colspan="5">Comunicarse al area de sistemas.${error}</td></tr>`);
    }
}

const pintarGrid = (data)=>{
    $("#listaProductos").html("");
 const tempGrid = $.trim($('#templateProductos').html()); //Carga de contenido del templateProductos
    try {
        data.data.forEach(element => {
            let clone = tempGrid.replace(/{{nombre}}/ig,element.Pro_Nombre); //Se reemplaza el contenido dew nombre por el elemnto de la peticion 
            clone = clone.replace(/{{cantidad}}/ig,element.BOM_Cantidad);
            clone = clone.replace(/{{sku}}/ig,element.Pro_SKU);
            clone = clone.replace(/{{hereda}}/ig,element.BOM_HeredarSerie);
            clone = clone.replace(/{{proid}}/ig,element.Pro_ID);
            $('#listaProductos').append(clone);

            let check = $("#heredaS"+element.Pro_ID);
            if(check.val() == 1){
                $("#heredaS"+element.Pro_ID).iCheck('check');
            }else{
                $("#heredaS"+element.Pro_ID).iCheck('uncheck');
            }
        });
    } catch (error) {
      $("#listaProductos").html(`<tr><td class="text-info text-center" colspan="5">"Favor de comunicarse al area de sistemas.${error}</td></tr>`);
    } 
    finally{
        $('.i-checks').iCheck({
            checkboxClass: 'icheckbox_square-green',
            radioClass: 'iradio_square-green',
        });
        $('.i-checks').on('ifClicked',function(e){
            e.preventDefault();
            const proID = $(e.currentTarget).attr("data-proid");
            heredaSerie(proID);
        });
        $('.btn-danger').click(e=>{
            e.preventDefault();
            const proID = $(e.currentTarget).attr("data-proid");
            eliminarRegistro(proID);
        });
    }
}

const buscarProdcuto = async () =>{
    const inputProducto = $('#input-prodcuto');
    if(inputProducto.val().length >= 3){
        $('#grid-productos').show();
        $("#Cargando").show();
        $("#Cargando").html(Global_loading);
        try{
            const res =  await utils.More.dataFeching(URL,{Opcion:2,Pro_Producto:inputProducto.val(),BOM_Pro_ID:ptID});
            if(res.result == 1){
                typeof res!=="undefined"?pintarGridProd(res):error(res)
                $("#gridProductosBusqueda").show('slow');
            }else{
              $("#gridProductosBusqueda").html('<div class="text-info text-center"><h2 >No hay registros con estos criterios.</h2></div>');
            }
        }catch(error){
            //console.log(error);
            $("#gridProductosBusqueda").html(`<div class="text-info text-center"><h2 >Favor de comunicarse a sistemas.${error}</h2></div>`);
        }finally{
            $("#Cargando").hide();
        }
    }else{
        Avisa("warning","B\u00FAsqueda","Se deben ingresar 3 o m\u00E1s caracteres de un sku o nombre para la b\u00FAsqueda de productos")
        inputProducto.focus();
    }
}

const pintarGridProd = (data) =>{
    const tempGrid = $.trim($('#templateProdutoBusqueda').html());
    try {
        data.data.forEach(element=>{
            let clone = tempGrid.replace(/{{SKU}}/ig,element.Pro_SKU);
            clone = clone.replace(/{{nombre_prod}}/ig,element.Pro_Descripcion);
            clone = clone.replace(/{{descripcion_prod}}/ig,element.Pro_Descripcion);
            clone = clone.replace(/{{Pro_ID}}/ig,element.Pro_ID);
            $("#gridProductosBusqueda").append(clone);
        })
    } catch (error) {
        //console.log(error);
         $("#gridProductosBusqueda").html(`<div class="text-info text-center"><h2>Favor de comunicarse al area de sistemas.${error}</h2></div>`);
    }
    finally{
    $("#Cargando").hide();
    }
}

const agregaraBom = async (iproID) =>{
    const cantidad = $("#c"+`${iproID}`);
    if(cantidad.val() >= 1){
        try{
            const res = await utils.More.dataFeching(URL,{Opcion:3,Cantidad:cantidad.val(),Pro_ID:iproID,BOM_Pro_ID:ptID});
            if(res.result === 1 && res.code === 201){ 
                Avisa("success","Producto",`${res.message}`);
            }
            if(res.result === -1 && res.code === 401){
                Avisa("warning","Producto","El producto ya se encuentra en la lista del bom");
            }
        }catch(error){
            //console.log(error);
            Avisa("warning","Producto",`${error}`);
        }finally{
            listaBom(ptID);
        }  
    }else{
        Avisa("warning","","La cantidad a agregar debe ser mayor que 0")
    }
}

const heredaSerie = async (iproID) =>{
    const checkH = $("#heredaS"+iproID);
    if(checkH.iCheck('check')){ 
        try {
           const response = await utils.More.dataFeching(URL,{Opcion:5,BOM_Pro_ID:ptID,Pro_ID:iproID});
           if(response.result == 1){
             Avisa("success","Serie","El cambio se a registrado con exito")
           }else{
            Avisa("Warning","Serie","No se pudo asignar serie");
           }
        } catch (error) {
            //console.log(error);
            Avisa("Warning","Serie",`${error}`)
        }
        finally{
            listaBom(ptID);
        }
    }
}

const eliminarRegistro = async (iproID) => {
    try {
        const response = await utils.More.dataFeching(URL,{Opcion:6,BOM_Pro_ID:ptID,Pro_ID:iproID})
        if (response.result == 1) {
            Avisa("Success","","El producto fue eliminado exitosamente")
            listaBom(ptID);
        } 
    } catch (error) {
        
    }
}