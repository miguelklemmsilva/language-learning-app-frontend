import React, {useContext, useState} from "react";
import {
    Pagination, PaginationItem, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TableSortLabel
} from '@mui/material';
import './VocabularyTable.scss';
import calculateTime from "../calculateTime";
import {HomeRouteContext} from "../../../contexts/HomeRouteContext";
import CircularProgress from '@mui/material/CircularProgress';

const VocabularyTable = ({wordTable, isHome, isCategoryView, addWords, isAddingVocabulary}) => {
    const {handleRemoveWord} = useContext(HomeRouteContext);
    const [order, setOrder] = useState('asc');
    const [orderBy, setOrderBy] = useState('word');
    const [page, setPage] = useState(1);
    const rowsPerPage = 15;
    const totalElements = wordTable.length;
    const x = (page - 1) * rowsPerPage + 1;
    const y = Math.min(page * rowsPerPage, totalElements);  // Taking the smaller of the two values to handle the last page
    const context = useContext(HomeRouteContext);

    const handleSortRequest = (property) => {
        const isAsc = orderBy === property && order === 'asc';
        setOrder(isAsc ? 'desc' : 'asc');
        setOrderBy(property);
    };

    const sortedWordTable = wordTable.sort((a, b) => {
        if (order === 'asc') {
            return a[orderBy] < b[orderBy] ? -1 : 1;
        } else {
            return a[orderBy] > b[orderBy] ? -1 : 1;
        }
    }).slice((page - 1) * rowsPerPage, page * rowsPerPage);

    const handlePageChange = (event, value) => {
        setPage(value);
    };

    const renderBars = (familiarity) => {
        const colors = ['grey', 'grey', 'grey'];

        if (familiarity >= 7) {
            colors[2] = 'green';
        }

        if (familiarity >= 4) {
            colors[1] = 'yellow';
        }

        if (familiarity >= 1) {
            colors[0] = 'red';
        }

        return colors.map((color, index) => <div key={index} className={`bar ${color}`}></div>);
    };

    const getDictionaryLink = (word) => {
        if (!context.activeLanguage) return null;
        const country = context.activeLanguage;
        return `https://www.collinsdictionary.com/dictionary/${country.toLowerCase()}-english/${word.replace(' ', '-')}`;
    }

    if (wordTable.length === 0) {
        return <div>
            <div style={{marginBottom: "10px"}}><strong>You have no words to practice!</strong></div>
            <div>Add some using the Add Vocabulary button</div>
        </div>
    }
    return (
      <div className="table">
        <TableContainer
          component={Paper}
          className={`vocab-table-wrapper ${isHome ? "home" : ""}`}
        >
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>
                  <TableSortLabel
                    className="vocab-table-label"
                    active={orderBy === "word"}
                    direction={orderBy === "word" ? order : "asc"}
                    onClick={() => handleSortRequest("word")}
                  >
                    <div className="arrow-balancer" />
                    Word
                  </TableSortLabel>
                </TableCell>
                <TableCell>
                  <TableSortLabel
                    active={orderBy === "boxNumber"}
                    direction={orderBy === "boxNumber" ? order : "asc"}
                    onClick={() => handleSortRequest("boxNumber")}
                  >
                    <div className="arrow-balancer" />
                    Familiarity
                  </TableSortLabel>
                </TableCell>{" "}
                {!isHome && !isCategoryView && (
                  <TableCell>
                    <TableSortLabel
                      active={orderBy === "minutesUntilDue"}
                      direction={orderBy === "minutesUntilDue" ? order : "asc"}
                      onClick={() => handleSortRequest("minutesUntilDue")}
                    >
                      <div className="arrow-balancer" />
                      Due
                    </TableSortLabel>
                  </TableCell>
                )}
                {!isCategoryView && (
                  <TableCell>
                    <TableSortLabel
                      active={orderBy === "lastSeen"}
                      direction={orderBy === "lastSeen" ? order : "asc"}
                      onClick={() => handleSortRequest("lastSeen")}
                    >
                      <div className="arrow-balancer" />
                      Last practiced
                    </TableSortLabel>
                  </TableCell>
                )}
                {!isHome && <TableCell></TableCell>}
              </TableRow>
            </TableHead>
            <TableBody>
              {sortedWordTable.map((word) => (
                <TableRow key={`${word.language}#${word.word}`}>
                  <TableCell>
                    <a
                      href={getDictionaryLink(word.word)}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {word.word}
                    </a>
                  </TableCell>
                  <TableCell>{renderBars(word.boxNumber)}</TableCell>
                  {!isHome && !isCategoryView && (
                    <TableCell>
                      {calculateTime(word.minutesUntilDue) === null
                        ? "now"
                        : "In " + calculateTime(word.minutesUntilDue)}
                    </TableCell>
                  )}
                  {!isCategoryView && (
                    <TableCell>
                      {calculateTime(word.lastSeen) === null
                        ? "just now"
                        : calculateTime(word.lastSeen) + " ago"}
                    </TableCell>
                  )}
                  {!isHome && (
                    <TableCell className="remove-word-td">
                      {!word.foundInWordTable && isCategoryView && (
                        <button
                          className="button add-btn generic-btn"
                          onClick={() => addWords([word.word])}
                        >
                          {isAddingVocabulary ? (
                            <CircularProgress
                              size={22}
                              sx={{ fontSize: "11px" }}
                            />
                          ) : (
                            "Add"
                          )}
                        </button>
                      )}
                      {(word.foundInWordTable || !isCategoryView) && (
                        <button
                          onClick={() => handleRemoveWord(word)}
                          className="button delete-btn generic-btn"
                        >
                          REMOVE
                        </button>
                      )}
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        {!isHome && (
          <div className="pagination">
            <Pagination
              page={page}
              count={Math.ceil(wordTable.length / rowsPerPage)}
              onChange={handlePageChange}
              renderItem={(item) => {
                if (
                  item.type === "start-ellipsis" ||
                  item.type === "end-ellipsis" ||
                  item.type === "page"
                ) {
                  return null;
                }
                return <PaginationItem {...item} />;
              }}
            />
            <span style={{ marginLeft: "1rem" }}>
              {x}-{y} of {totalElements}
            </span>
          </div>
        )}
      </div>
    );
}

export default VocabularyTable;