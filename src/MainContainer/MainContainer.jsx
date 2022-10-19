import React, { useEffect, useState } from "react";
import "./style.css";
import axios from "axios";
import { TfiAngleLeft } from "react-icons/tfi";
import { TfiAngleRight } from "react-icons/tfi";
import * as XLSX from "xlsx";
import file from "../../src/Nomics-Dashboard.csv";
import Axios from "axios"; // Import Axios or use Fetch.

function MainContainer() {
  const [data, setData] = useState([]);
  const [page, setPage] = useState({
    currentPage: 1,
    totalPage: 1,
    pageSize: 5,
    paginateDate: [],
  });
  const [storageData, setstorageData] = useState([]);
  const [localData, setlocalData] = useState([]);
  const [viewTable, setviewTable] = useState(true);
  const [currentPage, setcurrentPage] = useState(1);
  const [search, setSearch] = useState("")
  const dataLimit = 5;

  //GET json data from excel sheet
  const uploadExcelHandler = (e) => {
    var url = file;
    var oReq = new XMLHttpRequest();

    oReq.open("GET", url, true);
    oReq.responseType = "arraybuffer";

    oReq.onload = function (e) {
      var arraybuffer = oReq.response;

      var data = new Uint8Array(arraybuffer);
      var arr = new Array();
      for (var i = 0; i != data.length; ++i)
        arr[i] = String.fromCharCode(data[i]);
      var bstr = arr.join("");

      var workbook = XLSX.read(bstr, { type: "binary" });

      var first_sheet_name = workbook.SheetNames[0];
      var worksheet = workbook.Sheets[first_sheet_name];
      let excelData = XLSX.utils.sheet_to_json(worksheet);
      setData(excelData);
      setPage({
        ...page,
        paginateDate: excelData.slice(0, 5),
        totalPage: Math.ceil(excelData.length / page.pageSize),
      });
    };

    oReq.send();
  };

  const storageFunc = () => {
    let storage = JSON.parse(localStorage.getItem("crypto"));
    if (storage) {
      setstorageData(storage);
    }
  };

  const getData = async () => {
    // try {
    //   const data = await axios({
    //     method: "GET",
    //     url: "https://rest.coinapi.io/v1/list",
    //     headers: { "X-CoinAPI-Key": "212A843D-4272-4F10-8B5E-F667676B43E5" },
    //   }).then((res) => {
    //     if (res.data) {
    //       setData(res.data);
    //       setPaginateDate(res.data.slice(0,5))
    //       setPage({
    //         ...page,
    //         totalPage: Math.ceil(res.data.length / page.pageSize),
    //       });
    //     }
    //     console.log(res.data);
    //   });
    // } catch (error) {
    //   console.log(error);
    // }
  };

  useEffect(() => {
    getData();
    uploadExcelHandler();
    storageFunc();
  }, [viewTable]);

  useEffect(() => {
    let startIndex = currentPage * dataLimit - dataLimit;
    let endIndex = startIndex + dataLimit;
    let temp = data.slice(startIndex, endIndex);
    setPage({ ...page, paginateDate: temp });
  }, [currentPage]);


  useEffect(() => {
    if(search){
    let temp = data.filter(x => x?.name?.toLowerCase().includes(search.toLowerCase()))
    console.log(temp,search)
    setPage({...page,paginateDate:temp})
    }else{
        setPage({...page,paginateDate:data.slice(0,5)})
    }
  },[search])


  const handleSave = (id) => {
    if (!localStorage.getItem("crypto")) {
      localStorage.setItem("crypto", JSON.stringify([id]));
    } else {
      let items = JSON.parse(localStorage.getItem("crypto"));
      if (!items.includes(id)) {
        localStorage.setItem("crypto", JSON.stringify([...items, id]));
      }
    }
    console.log(localStorage.getItem("crypto"));
    storageFunc();
  };

  const handleView = () => {
    setviewTable(false);
    let local = data.filter((x) => storageData.includes(x.id));
    console.log(local);
    setlocalData(local);
  };

  const deleteHandler = (id) => {
    let tempx = JSON.parse(localStorage.getItem("crypto"));
    tempx = tempx.filter((x) => x != id);
    localStorage.setItem("crypto", JSON.stringify(tempx));
    let storage = JSON.parse(localStorage.getItem("crypto"));
    let local = data.filter((x) => storage.includes(x.id));
    setlocalData(local)
  };

  return (
    <div className="mainContainer">
      <div className="container">
        <div className="card">
          <div className="cardItem">
          <p>GOOGL</p>
          <img className="logo" src="GOOGL.png" />
          </div>
          <span>1515 USD</span>
        </div>
        <div className="card">
          <div className="cardItem">
          <p>FB</p>
          <img className="logo" src="FB.png" />
          </div>
          <span>266 USD</span>
          </div>
        <div className="card">
          <div className="cardItem">
          <p>FB</p>
          <img className="logo" src="https://upload.wikimedia.org/wikipedia/commons/4/4a/Amazon_icon.svg" />
          </div>
          <span>3116 USD</span></div>
      </div>
      <div className="table">
        {viewTable ? (
          <table>
            <tr>
              <th>Stock Details Table</th>
              <th colSpan={3}>
                <input type={"search"} onChange = {(e) => setSearch(e.target.value)} placeholder="Search by Comapny name" />
              </th>
            </tr>
            <tr className="tableHeader">
              <th>Company Name</th>
              <th>SYMBOL</th>
              <th colSpan={"1"}>MARKET CAP</th>
              <th></th>
              <th>CURRENT PRICE</th>
            </tr>
            {page.paginateDate ? (
              page.paginateDate?.map((x) => {
                return (
                  <tr>
                    <td>{x.name}</td>
                    <td>{x.symbol}</td>
                    <td>{x?.market_cap}</td>
                    <td>
                      {storageData.includes(x.id) ? (
                        <button className="view" onClick={handleView}>
                          View
                        </button>
                      ) : (
                        <button
                          className="save"
                          onClick={() => handleSave(x.id)}
                        >
                          Save Data
                        </button>
                      )}
                    </td>
                    <td>{x?.price}</td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <th>Loading ...</th>
              </tr>
            )}

            <tr className="tableHeader">
              <td
                style={{ textAlign: "right", paddingRight: "5%" }}
                colSpan={5}
              >
                <span className="paginate">
                   {currentPage} Of {page.totalPage}{" "}
                  <span>
                    {" "}
                    <TfiAngleLeft
                      className="next"
                      onClick={() =>
                        currentPage > 1 && setcurrentPage(currentPage - 1)
                      }
                    />{" "}
                    &nbsp;&nbsp;&nbsp;
                    <TfiAngleRight
                      className="next"
                      onClick={() =>
                        currentPage < page.totalPage &&
                        setcurrentPage(currentPage + 1)
                      }
                    />
                  </span>
                  {console.log(currentPage, page.totalPage)}
                </span>
              </td>
            </tr>
          </table>
        ) : (
          <table>
            <tr className="tableHeader">
              <th colSpan={5}>SAVED DATA TABLE</th>
            </tr>
            {localData.length ? (
              localData.map((x) => {
                return (
                  <tr>
                    {" "}
                    <td>{x.name}</td>
                    <td>{x.symbol}</td>
                    <td>{x?.market_cap}</td>
                    <th>
                      <button
                        className="view"
                        onClick={() => deleteHandler(x.id)}
                      >
                        Delete
                      </button>
                    </th>
                    <td>{x?.price}</td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <th>No Data</th>
              </tr>
            )}
            <tr className="tableHeader">
              <th colSpan={5}>
                <button className="view" onClick={() => setviewTable(true)}>
                  Back
                </button>
              </th>
            </tr>
          </table>
        )}
      </div>
    </div>
  );
}

export default MainContainer;

// import React, { useEffect, useState } from "react";
// import "./style.css";
// import axios from "axios";
// import { DataGrid } from "@mui/x-data-grid";

// function MainContainer() {
//   const [data, setData] = useState([]);

//   const getData = async () => {
//     try {
//       const data = await axios({
//         method: "GET",
//         url: "https://rest.coinapi.io/v1/assets",
//         headers: { "X-CoinAPI-Key": "212A843D-4272-4F10-8B5E-F667676B43E5" },
//       }).then((res) => {
//         if (res.data) {
//           setData(res.data);
//         }
//         console.log(res.data);
//       });
//     } catch (error) {
//       console.log(error);
//     }
//   };

//   useEffect(() => {
//     getData();
//   }, []);

//   const columns = [
//     // { field: "id", headerName: "ID", width: 70 },
//     { field: "firstName", headerName: "First name", width: 250 },
//     { field: "lastName", headerName: "Last name", width: 250 },
//     {
//       field: "age",
//       headerName: "Age",
//       type: "number",
//       width: 250,
//     },
//     {
//       field: "fullName",
//       headerName: "Full name",
//       description: "This column has a value getter and is not sortable.",
//       sortable: false,
//       width: 250,
//       valueGetter: (params) =>
//         `${params.row.firstName || ""} ${params.row.lastName || ""}`,
//     },
//   ];

//   const rows = [
//     { id: 1, lastName: "Snow", firstName: "Jon", age: 35 },
//     { id: 2, lastName: "Lannister", firstName: "Cersei", age: 42 },
//     { id: 3, lastName: "Lannister", firstName: "Jaime", age: 45 },
//     { id: 4, lastName: "Stark", firstName: "Arya", age: 16 },
//     { id: 5, lastName: "Targaryen", firstName: "Daenerys", age: null },
//     { id: 6, lastName: "Melisandre", firstName: null, age: 150 },
//     { id: 7, lastName: "Clifford", firstName: "Ferrara", age: 44 },
//     { id: 8, lastName: "Frances", firstName: "Rossini", age: 36 },
//     { id: 9, lastName: "Roxie", firstName: "Harvey", age: 65 },
//   ];

//   return (
//     <div className="mainContainer">
//       <div className="container">
//         <div className="card"></div>
//         <div className="card"></div>
//         <div className="card"></div>
//       </div>
//       <div className="table">
//         {/* <table>
//             <tr>
//                 <th>Stock Details Table</th>
//                 <th><input type={'search'} /></th>
//             </tr>
//             <tr className="tableHeader">
//                 <th>Company Name</th>
//                 <th>SYMBOL</th>
//                 <th colSpan={'1'}>MARKET CAP</th>
//                 <th></th>
//                 <th>CURRENT PRICE</th>
//             </tr>
//             {
//                 data ?
//                 data?.map(x => {
//                     return <tr key={Math.random()}>
//                     <td>{x.name}</td>
//                     <td>{x.data_symbols_count}</td>
//                     <td>{x?.price_usd}</td>
//                     <td>141 Capital</td>
//                     <td>141 Capital</td>
//                 </tr>
//                 })
//                 : "loading..."}

//             <tr className="tableHeader"></tr>
//         </table> */}

//         <DataGrid
//           autoHeight="50px"
//           rows={rows}
//           columns={columns}
//           pageSize={5}
//           rowsPerPageOptions={[5]}
//           checkboxSelection = {false}
//         />
//       </div>
//     </div>
//   );
// }

// export default MainContainer;
