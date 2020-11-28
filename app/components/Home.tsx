import React, { Component } from 'react';
import SearchPanel from './SearchPanel';
import { Link } from 'react-router-dom';
import routes from '../constants/routes.json';
import styles from './Home.css';

var sqlite3 = require('sqlite3').verbose();

export default class Home extends Component {

  constructor(props) {
    super(props);

    this.state = {
      shabadRow: {
        gurmukhi: '',
        punjabi_translation: '',
        english_translation: '',
      }
    };
  }

  showShabadRow = (id) => {
    let db = new sqlite3.Database('gurbani.db');
    db.all(
      `
        select lines.*, punjabi_translations.translation as punjabi_translation, english_translations.translation as english_translation
        from lines
        left join translations as punjabi_translations on
          lines.id = punjabi_translations.line_id AND
          punjabi_translations.translation_source_id = 6
        left join translations as english_translations on
          lines.id = english_translations.line_id AND
          english_translations.translation_source_id = 1
        where id = '${id}'
      `,
      (err, rows) => {
        let row = rows[0];
        row.gurmukhi = this.removePronousation(row.gurmukhi);
        this.setState({
          shabadRow: row
      });
    });
    db.close();
  }

  removePronousation = (gurmukhi) => {
    return gurmukhi.replace(/[,]|[;]|[.]/g, '');
  }

  render() {
    let { shabadRow } = this.state;
    return (
      <div className="container-fluid">
        <div className="row">
          <div className="col-12 gurbani-akhar-regular shabad-row-gurmukhi"
            style={{
              fontSize: "74px",
              marginTop: "3%",
              textAlign: "center",
              fontWeight: "bold",
              color: "#1e70d1",
            }}
          >
            { shabadRow.gurmukhi }
          </div>
          <div className="col-12 gurbani-akhar-regular shabad-row-gurmukhi"
            style={{
              fontSize: "45px",
              marginTop: "5%",
              textAlign: "center"
            }}
          >
            { shabadRow.punjabi_translation }
          </div>
          <div className="col-12"
            style={{
              fontSize: "40px",
              marginTop: "5%",
              textAlign: "center"
            }}
          >
            { shabadRow.english_translation }
          </div>
        </div>
        <SearchPanel showShabadRow={this.showShabadRow} />
      </div>
    );
  }
}
