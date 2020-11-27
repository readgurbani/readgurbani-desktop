import React, { Component } from 'react';
var sqlite3 = require('sqlite3').verbose();

class SearchPanel extends Component {
  constructor(props) {
    super(props);
    this.state = {
      searchText: '',
      searchResult: [],
      shabadResult: [],
      currentShabadRow: null,
      minimized: false,
      showSearchTab: true,
      showShabadTab: false,
      shabadRow: {
        gurmukhi: '',
      }
    };
  }

  componentDidMount() {
    window.addEventListener("keydown", this.navigate);
  }

  handleChange = (event) => {
    let fieldName = event.target.name;
    let state = this.state;
    state[fieldName] = event.target.value;
    this.setState(state);
  }

  searchChange = (event) => {
    this.handleChange(event);
    if (event.target.value.length <= 2) {
      return;
    }

    this.search();
  }

  search = () => {
    let db = new sqlite3.Database('gurbani.db');
    let term = this.state.searchText;
    db.all("select * from lines where first_letters like '%" + term + "%'", (err, rows) => {
      this.setState({
        searchResult: rows
      });
    });
    db.close();
  }

  showShabad = (id, rowId) => {
    let db = new sqlite3.Database('gurbani.db');
    db.all("select * from lines where shabad_id = '" + id + "'", (err, rows) => {
      rows.map((row, index) => {
        if (row.id === rowId) {
          this.setState({
            currentShabadRow: index
          });
        }
      });
      this.setState({
        shabadResult: rows
      });
    });
    db.close();

    this.setState({
      showSearchTab: false,
      showShabadTab: true,
    });
  }

  removePronousation = (gurmukhi) => {
    return gurmukhi.replace(/[,]|[;]|[.]/g, '');
  }

  showSearchTab = () => {
    this.setState({
      showSearchTab: true,
      showShabadTab: false,
    });
  }

  showShabadTab = () => {
    this.setState({
      showSearchTab: false,
      showShabadTab: true,
    });
  }

  toggleSearchPanel = () => {
    const { minimized } = this.state;
    this.setState({
      minimized: ! minimized
    });
  }

  navigate = (event) => {
    const { showShabadTab, shabadResult } = this.state;
    let { currentShabadRow } = this.state;
    if (showShabadTab) {
      switch (event.key) {
        case "ArrowUp":
          currentShabadRow--;
          break;

        case "ArrowDown":
          currentShabadRow++;
          break;

        case "ArrowLeft":
          currentShabadRow--;
          break;

        case "ArrowRight":
          currentShabadRow++;
          break;
      }

      const currentSerial = currentShabadRow + 1;
      if (currentSerial === 0 || currentSerial > shabadResult.length) {
        return;
      }

      const rowId = shabadResult[currentShabadRow].id;

      this.setState({
        currentShabadRow: currentShabadRow
      });
      this.showShabadRow(rowId);
      event.preventDefault();
    }
  }

  showShabadRow = (rowId) => {
    this.props.showShabadRow(rowId);
    let element = document.getElementById('row-' + rowId);

    if (element === null) {
      return;
    }

    //scroll only when current row is outside of view
    const gap = 40 * 2;
    const elementTop = document.getElementById('row-' + rowId).offsetTop + gap;
    const cardTop = document.getElementById('shabad-card').offsetHeight + document.getElementById('shabad-card').scrollTop;
    if (elementTop > cardTop) {
      element.scrollIntoView(true);
    } else if (document.getElementById('shabad-card').scrollTop > document.getElementById('row-' + rowId).offsetTop) {
      element.scrollIntoView(true);
    }
  }

  render() {
    const { searchResult, shabadResult, showSearchTab, showShabadTab, minimized, currentShabadRow } = this.state;

    const searchListItems = searchResult.map((row) => {
      row.gurmukhi = this.removePronousation(row.gurmukhi);
      return (
        <li className="list-group-item border-0" key={row.id}>
          <a onClick={this.showShabad.bind(this, row.shabad_id, row.id)}>{row.gurmukhi}</a>
        </li>
      )
    });

    const shabadListItems = shabadResult.map((row, index) => {
      const selectedClass = index === currentShabadRow ? 'fw-bold' : '';
      row.gurmukhi = this.removePronousation(row.gurmukhi);
      return (
        <li
          id={`row-${row.id}`}
          className={`list-group-item border-0 ${selectedClass}`}
          key={row.id}
        >
          <a onClick={this.showShabadRow.bind(this, row.id)}>{row.gurmukhi}</a>
        </li>
      );
    });

    const minimizedClass = minimized ? 'd-none' : '';
    const searchTabClass = showSearchTab ? '' : 'd-none';
    const shabadTabClass = showShabadTab ? '' : 'd-none';

    return (
      <div>
        <div
          style={{
            position: "absolute",
            right: 0,
            bottom: 0,
            width: "40%",
            height: "30%"
          }}
          className={`card ${minimizedClass}`}
        >
          {
            showSearchTab &&
            <div className="card-header">
              <div className="row">
                  <div className="col-12">
                      <input
                        type="text"
                        className={`form-control gurbani-akhar-regular`}
                        name="searchText"
                        value={this.state.searchText}
                        onChange={this.searchChange}
                      />
                      <a
                        onClick={this.search}
                        className="btn btn-dark position-absolute"
                        style={{top: 8, right: 17, borderTopLeftRadius: 0, borderBottomLeftRadius: 0}}
                      >
                        <i className="fas fa-search"></i>
                      </a>
                  </div>
              </div>
            </div>
          }
          <div
            className={`card-body mb-3 ${searchTabClass}`}
            style={{
              overflowX: "auto",
            }}
            onKeyDown={this.navigate}
          >
            <div className="row">
              <div className="col-md-12">
                <ul className="gurbani-akhar-regular list-group">
                  { searchListItems }
                </ul>
              </div>
            </div>
          </div>
          <div
            id="shabad-card"
            className={`card-body mb-3 ${shabadTabClass}`}
            style={{
              overflowX: "auto",
            }}
          >
            <div className="row">
              <div className="col-md-12">
                <ul className="gurbani-akhar-regular list-group">
                  { shabadListItems }
                </ul>
              </div>
            </div>
          </div>

          <div
            className="position-absolute container-fluid bg-light"
            style={{
              bottom: 0,
              fontSize: "20px",
          }}>
            <div
              className="row"
            >
              <div className="col-md-12 text-right">
                <a onClick={this.showSearchTab} className="float-left text-dark">
                  <i className="fas fa-search"></i>
                </a>
                <a onClick={this.showShabadTab} className="float-left text-dark">
                  <i className="far fa-caret-square-down ml-3"></i>
                </a>
                <a onClick={this.toggleSearchPanel} className="float-right text-dark">
                  <i className="far fa-window-restore ml-3"></i>
                </a>
              </div>
            </div>
          </div>
        </div>
        {
          minimized &&
          <div className="position-absolute"
            style={{
              bottom: 0,
              right: 10,
              fontSize: "20px",
            }}
          >
            <a onClick={this.toggleSearchPanel} className="ml-3 text-dark">
              <i class="far fa-window-maximize"></i>
            </a>
          </div>
        }
      </div>
    )
  }
}

export default SearchPanel;
