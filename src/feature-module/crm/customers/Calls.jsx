import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom';
import { callStatus } from '../../../core/common/selectoption/selectoption';
import Table from "../../../core/common/dataTable/index";
import { FaCloudDownloadAlt } from 'react-icons/fa';
import { CiPlay1 } from 'react-icons/ci';
import { owner as companyEmployee } from '../../../core/common/selectoption/selectoption';
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { utils, writeFile } from "xlsx";
import { callsData } from "../../../core/data/json/calls";


const Calls = () => {

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCallStatus, setSelectedCallStatus] = useState([]);
  const [searchEmployeeInFilter, setSearchEmployeeInFilter] = useState("");
  const [selectedEmployee, setSelectedEmployee] = useState([]);
  const [stars, setStars] = useState({});
  const [columnVisibility, setColumnVisibility] = useState({
    "": true,
    "Call Id": true,
    "Agent Name": true,
    "Call Type": true,
    "Call Date": true,
    "Call Duration": true,
    "Call Status": true,
    "Next FollowUp": true,
    "Recording": true,
});

  useEffect(() => {
    return () => { }
  }, [])


  const currentDateAndTime = new Date();
  const currentDate = currentDateAndTime.toLocaleDateString();
  const currentTime = currentDateAndTime.toLocaleTimeString();

  const columns = [
    {
        title: "",
        dataIndex: "",
        render: (text, record, index) => (
            <div
                className={`set-star rating-select ${stars[index] ? "filled" : ""}`}
                onClick={() => handleStarToggle(index)}
            >
                <i className="fa fa-star"></i>
            </div>
        ),
    },
    {
        title: "Call Id",
        dataIndex: "callId",
        key: "callId",
        sorter: (a, b) => a.callId.localeCompare(b.callId),
    },
    {
        title: "Agent Name",
        dataIndex: "agentName",
        key: "agentName",
        sorter: (a, b) => a.agentName.localeCompare(b.agentName),
    },
    {
        title: "Call Date",
        dataIndex: "callDate",
        key: "callDate",
        sorter: (a, b) => a.callDate.localeCompare(b.callDate),
    },
    {
        title: "Call Duration",
        dataIndex: "callDuration",
        key: "callDuration",
        sorter: (a, b) => a.callDuration.localeCompare(b.callDuration),
    },
    {
        title: "Call Status",
        dataIndex: "callStatus",
        key: "callStatus",
        sorter: (a, b) => a.callStatus.localeCompare(b.callStatus),
    },
    {
        title: "Next FollowUp",
        dataIndex: "nextFollowUp",
        key: "nextFollowUp",
        sorter: (a, b) => a.nextFollowUp.localeCompare(b.nextFollowUp),
    },
    {
        title: "Recording",
        dataIndex: "recordingLink",
        key: "recordingLink",
        render: (text) => (
            <div className="d-flex justify-content-center align-items-center">
                <span style={{ color: '#00918E' }} className="me-3">
                    <FaCloudDownloadAlt />
                </span>
                <span style={{ color: "blue" }}>
                    <CiPlay1 />
                </span>
            </div>
        ),
    },
];

const handleStarToggle = (index) => {
  setStars((prevStars) => ({
      ...prevStars,
      [index]: !prevStars[index],
  }));
};

  const filterCallStatus = (callStatus) => {
    setSelectedCallStatus((prevStatus) =>
      prevStatus.includes(callStatus)
        ? prevStatus.filter((status) => status !== callStatus)
        : [...prevStatus, callStatus]
    );
  };

  const filteredEmployees = companyEmployee.filter((employee) =>
    employee.value.toLowerCase().includes(searchEmployeeInFilter.toLowerCase())
  );

  const filterLeadEmployee = (leadEmployee) => {
    setSelectedEmployee((prevStatus) =>
      prevStatus.includes(leadEmployee)
        ? prevStatus.filter((employee) => employee !== leadEmployee)
        : [...prevStatus, leadEmployee]
    );
  };

  const resetFilters = () => {
    setSelectedCallStatus([]);
    setSelectedEmployee([]);
    setSearchEmployeeInFilter('');
};

const handleToggleColumnVisibility = (columnTitle) => {
  setColumnVisibility((prevVisibility) => ({
      ...prevVisibility,
      [columnTitle]: !prevVisibility[columnTitle],
  }));
};

const exportPDF = () => {
  const doc = new jsPDF();
  const filteredColumns = columns.filter(
      (col) =>
          columnVisibility[col.title] &&
          col.title !== "Recording"
  );
  const headers = filteredColumns.map((col) => col.title);
  const data = filteredCallData.map((row) =>
      filteredColumns.map((col) => row[col.dataIndex] || "")
  );
  const pageWidth = doc.internal.pageSize.getWidth();
  const titleText = "Calls Report";
  const titleWidth = doc.getTextWidth(titleText);
  const titleX = (pageWidth - titleWidth) / 2;

  doc.setFontSize(15);
  doc.text(titleText, titleX, 20);

  doc.setFontSize(10);
  doc.text(`Exported on: ${currentDate} at ${currentTime}`, 15, 35);


  autoTable(doc, {
      startY: 40,
      head: [headers],
      body: data,
  });
  doc.save("Call-details.pdf");
};

const exportExcel = () => {
  const wb = utils.book_new();
  const filteredColumns = columns.filter((col) =>
      columnVisibility[col.title] && col.title !== "Recording"
  );

  const wsData = [
      filteredColumns.map((col) => col.title),
      ...filteredCallData.map((row) =>
          filteredColumns.map((col) => row[col.dataIndex] || "")
      ),
  ];

  const ws = utils.aoa_to_sheet(wsData);

  utils.book_append_sheet(wb, ws, "Calls");

  writeFile(wb, "calls_report.xlsx");
};

const filteredCallData = callsData.filter((calls) => {

  const isAnySearchColumnVisible =
      columnVisibility["Call Id"] ||
      columnVisibility["Agent Name"];

  const matchesSearchQuery =
      !isAnySearchColumnVisible ||
      (calls.callId.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (calls.agentName.toLowerCase().includes(searchQuery.toLowerCase()))
  // (columnVisibility["Call Id"] && calls.callId.toLowerCase().includes(searchQuery.toLowerCase())) ||
  // (columnVisibility["Agent Name"] && calls.agentName.toLowerCase().includes(searchQuery.toLowerCase()))


  const matchesStatus =
      selectedCallStatus.length === 0 ||
      selectedCallStatus.includes(calls.callStatus.toLowerCase());


  const matchesEmployee =
      selectedEmployee.length === 0 ||
      selectedEmployee.includes(calls.agentName.toLowerCase());


  return matchesSearchQuery && matchesStatus && matchesEmployee

});

const visibleColumns = columns.filter(
  (column) => columnVisibility[column.title]
);
  return (
    <div id="calls">
      <div className="card">
        <div className="card-header">
          <div className="row align-items-center">
            <div className="col-sm-12">
              <div className="d-flex justify-content-between">
                <div className="d-flex">
                  <div className="icon-form mb-3  me-2 mb-sm-0">
                    <span className="form-icon">
                      <i className="ti ti-search" />
                    </span>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Search Calls"
                      onChange={(text) =>
                        setSearchQuery(text.target.value)
                      }
                    />
                  </div>
                  <div className="form-sorts dropdown me-2">
                    <Link
                      to=""
                      data-bs-toggle="dropdown"
                      data-bs-auto-close="outside"
                    >
                      <i className="ti ti-filter-share" />
                      Filter
                    </Link>
                    <div className="filter-dropdown-menu dropdown-menu  dropdown-menu-md-end p-3">
                      <div className="filter-set-view">
                        <div className="filter-set-head">
                          <h4>
                            <i className="ti ti-filter-share" />
                            Filter
                          </h4>
                        </div>
                        <div className="accordion" id="accordionExample">


                          <div className="filter-set-content">
                            <div className="filter-set-content-head">
                              <Link
                                to=""
                                className="collapsed"
                                data-bs-toggle="collapse"
                                data-bs-target="#Status"
                                aria-expanded="false"
                                aria-controls="Status"
                              >
                                Call Status
                              </Link>
                            </div>
                            <div
                              className="filter-set-contents accordion-collapse collapse"
                              id="Status"
                              data-bs-parent="#accordionExample"
                            >
                              <div className="filter-content-list">
                                <ul>
                                  {callStatus.map((callStatus, index) => {
                                    return (
                                      <li
                                        key={index}

                                      >
                                        <div className="filter-checks" >
                                          <label className="checkboxs" >
                                            <input
                                              type="checkbox"
                                              checked={selectedCallStatus.includes(callStatus.value.toLowerCase())}
                                              onChange={() => filterCallStatus(callStatus.value.toLowerCase())}
                                            />
                                            <span className="checkmarks" />
                                            {callStatus.value}
                                          </label>
                                        </div>
                                      </li>
                                    );
                                  })}

                                </ul>
                              </div>
                            </div>
                          </div>

                          <div className="filter-set-content">
                            <div className="filter-set-content-head">
                              <Link
                                to=""
                                className="collapsed"
                                data-bs-toggle="collapse"
                                data-bs-target="#owner"
                                aria-expanded="false"
                                aria-controls="owner"
                              >
                                Employee
                              </Link>
                            </div>
                            <div
                              className="filter-set-contents accordion-collapse collapse"
                              id="owner"
                              data-bs-parent="#accordionExample"
                            >
                              <div className="filter-content-list">
                                <div className="mb-2 icon-form">
                                  <span className="form-icon">
                                    <i className="ti ti-search" />
                                  </span>
                                  <input
                                    type="text"
                                    className="form-control"
                                    placeholder="Search Owner"
                                    value={searchEmployeeInFilter}
                                    onChange={(e) => setSearchEmployeeInFilter(e.target.value)}
                                  />
                                </div>
                                <ul>
                                  {
                                    filteredEmployees.map((companyEmployee, index) => {
                                      return (
                                        <li key={index}>
                                          <div className="filter-checks">
                                            <label className="checkboxs">
                                              <input
                                                type="checkbox"
                                                checked={selectedEmployee.includes(companyEmployee.value.toLowerCase())}
                                                onChange={() => filterLeadEmployee(companyEmployee.value.toLowerCase())}
                                              />
                                              <span className="checkmarks" />
                                              {companyEmployee.value}
                                            </label>
                                          </div>
                                        </li>
                                      )
                                    })
                                  }
                                </ul>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="filter-reset-btns">
                          <div className="row">
                            <div className="col-6">
                            </div>
                            <div className="col-6">
                              <Link to="" className="btn btn-primary" onClick={resetFilters}>
                                Reset
                              </Link>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="dropdown">
                    <Link
                      to=""
                      className="btn bg-soft-purple text-purple"
                      data-bs-toggle="dropdown"
                      data-bs-auto-close="outside"
                    >
                      <i className="ti ti-columns-3 me-2" />
                      Manage Columns
                    </Link>
                    <div className="dropdown-menu  dropdown-menu-md-end dropdown-md p-3">
                      <h4 className="mb-2 fw-semibold">
                        Want to manage datatables?
                      </h4>
                      <p className="mb-3">
                        Please drag and drop your column to reorder your
                        table and enable see option as you want.
                      </p>
                      <div className="border-top pt-3">
                        {columns.map((column, index) => {
                          if (
                            column.title === "Action" ||
                            column.title === ""
                          ) {
                            return;
                          }
                          return (
                            <div
                              className="d-flex align-items-center justify-content-between mb-3"
                              key={index}
                            >
                              <p className="mb-0 d-flex align-items-center">
                                <i className="ti ti-grip-vertical me-2" />
                                {column.title}
                              </p>
                              <div
                                className="status-toggle"

                              >
                                <input
                                  type="checkbox"
                                  id={column.title}
                                  className="check"
                                  defaultChecked={true}
                                  onClick={() =>
                                    handleToggleColumnVisibility(
                                      column.title
                                    )
                                  }
                                />
                                <label
                                  htmlFor={column.title}
                                  className="checktoggle"
                                />
                              </div>
                            </div>
                          );
                        })}

                      </div>
                    </div>
                  </div>
                </div>
                <div className="d-flex">
                  <div className="dropdown me-2">
                    <Link
                      to=""
                      className="dropdown-toggle"
                      data-bs-toggle="dropdown"
                    >
                      <i className="ti ti-package-export me-2" />
                      Export
                    </Link>
                    <div className="dropdown-menu  dropdown-menu-end">
                      <ul className="mb-0">
                        <li>
                          <Link
                            to=""
                            className="dropdown-item"
                            onClick={exportPDF}
                          >
                            <i className="ti ti-file-type-pdf text-danger me-1" />
                            Export as PDF
                          </Link>
                        </li>
                        <li>
                          <Link
                            to=""
                            className="dropdown-item"
                            onClick={exportExcel}
                          >
                            <i className="ti ti-file-type-xls text-green me-1" />
                            Export as Excel{" "}
                          </Link>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>

              </div>
            </div>
            <div className="col-sm-8">
              <div className="d-flex align-items-center flex-wrap row-gap-2 justify-content-sm-end">

              </div>
            </div>
          </div>
        </div>
        <div className="card-body">
          <div className="table-responsive custom-table">
            <Table
              dataSource={filteredCallData}
              columns={visibleColumns}
              rowKey={(record) => record.key}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

export default Calls