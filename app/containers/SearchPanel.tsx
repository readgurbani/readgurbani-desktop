import React, { Component } from 'react';
var sqlite3 = require('sqlite3').verbose();

class SearchPanel extends Component {
  constructor(props) {
    super(props);
    this.state = {
      searchText: '',
      searchResult: [],
      shabadResult: [],
      showSearchTab: true,
      showShabadTab: false,
      shabadRow: {
        gurmukhi: '',
      }
    };
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
    return gurmukhi.replace(new RegExp("\(\.|\;|\,)", "g"), '');
  }

  render() {
    const { searchResult, shabadResult, showSearchTab, showShabadTab } = this.state;

    let listItems = '';
    console.log(showSearchTab);
    console.log(showShabadTab);
    if (showSearchTab) {
      listItems = searchResult.map((row) => {
        row.gurmukhi = row.gurmukhi.replace(new RegExp("\\.|\;", "g"), '');
        return (
          <li className="list-group-item border-0" key={row.id}>
            <a onClick={this.showShabad.bind(this, row.shabad_id, row.id)}>{row.gurmukhi}</a>
          </li>
        )
      })
    } else {
      listItems = shabadResult.map((row) => (
        <li className="list-group-item border-0" key={row.id}>
          <a onClick={this.props.showShabadRow.bind(this, row.id)}>{row.gurmukhi}</a>
        </li>
      ))
    }

    return (
    <div
      style={{
        position: "absolute",
        right: 0,
        bottom: 0,
        width: "40%",
        height: "30%",
        overflowX: "auto",
      }}
      className="card"
    >
      <div className="card-body">
        <div className="row">
          {
            showSearchTab &&
            <div className="col-12">

                <input
                  type="text"
                  className={`form-control gurbani-akhar-regular $(showSearchTab ? '' : 'd-none')`}
                  name="searchText"
                  value={this.state.searchText}
                  onChange={this.searchChange}
                />
                <a
                  onClick={this.search}
                  className="btn btn-primary position-absolute"
                  style={{top: 15, right: 17, borderTopLeftRadius: 0, borderBottomLeftRadius: 0}}
                >
                  <i className="fas fa-search"></i>
                </a>
            </div>
          }
        </div>
        <div className="row">
          <div className="col-md-12">
            <ul className="gurbani-akhar-regular list-group">
              { listItems }
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
    }
}

export default SearchPanel;