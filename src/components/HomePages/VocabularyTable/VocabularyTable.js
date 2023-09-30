import React, {useContext, useState} from "react";
import {
    Pagination,
    PaginationItem,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TableSortLabel
} from '@mui/material';
import './VocabularyTable.scss';
import calculateTime from "../calculateTime";
import {HomeRouteContext} from "../../../contexts/HomeRouteContext";

const VocabularyTable = ({wordTable, isHome}) => {
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
        console.log(`https://www.collinsdictionary.com/dictionary/${country}-english/${word.replace(' ', '-')}`)
        return `https://www.collinsdictionary.com/dictionary/${country.toLowerCase()}-english/${word.replace(' ', '-')}`;
    }

    if (wordTable.length === 0) {
        return <div>
            <div style={{marginBottom: "10px"}}><strong>You have no words to practice!</strong></div>
            <div>Add some using the Add Vocabulary button</div>
        </div>
    }
    return (<div>
         <TableContainer component={Paper} className={`vocab-table-wrapper ${isHome ? 'home' : ''}`}>
            <Table>
                <TableHead>
                    <TableRow>
                        <TableCell>
                            <TableSortLabel className="vocab-table-label"
                                            active={orderBy === "word"}
                                            direction={orderBy === "word" ? order : 'asc'}
                                            onClick={() => handleSortRequest("word")}
                            >
                                <div className="arrow-balancer"/>
                                Word
                            </TableSortLabel>
                        </TableCell>
                        <TableCell>
                            <TableSortLabel
                                active={orderBy === "box_number"}
                                direction={orderBy === "box_number" ? order : 'asc'}
                                onClick={() => handleSortRequest("box_number")}
                            >
                                <div className="arrow-balancer"/>
                                Familiarity
                            </TableSortLabel>
                        </TableCell>
                        {!isHome && <TableCell>
                            <TableSortLabel
                                active={orderBy === "minutes_until_due"}
                                direction={orderBy === "minutes_until_due" ? order : 'asc'}
                                onClick={() => handleSortRequest("minutes_until_due")}
                            >
                                <div className="arrow-balancer"/>
                                Due
                            </TableSortLabel>
                        </TableCell>}
                        <TableCell>
                            <TableSortLabel
                                active={orderBy === "last_seen"}
                                direction={orderBy === "last_seen" ? order : 'asc'}
                                onClick={() => handleSortRequest("last_seen")}
                            >
                                <div className="arrow-balancer"/>
                                Last practiced
                            </TableSortLabel>
                        </TableCell>
                        {!isHome && <TableCell>Remove</TableCell>}
                    </TableRow>
                </TableHead>
                <TableBody>
                    {sortedWordTable.map((word) => (<TableRow key={word.word_id}>
                        <TableCell><a href={getDictionaryLink(word.word)} target="_blank" rel="noopener noreferrer">{word.word}</a></TableCell>
                        <TableCell>{renderBars(word.box_number)}</TableCell>
                        {!isHome && <TableCell>{calculateTime(word.minutes_until_due) === null ? "now" : "In " + calculateTime(word.minutes_until_due)}</TableCell>}
                        <TableCell>{calculateTime(word.last_seen) === null ? "just now" : calculateTime(word.last_seen) + " ago"}</TableCell>
                        {!isHome && <TableCell className="remove-word-td">
                            <button onClick={() => handleRemoveWord(word)} className="button delete-btn">
                                REMOVE
                            </button>
                        </TableCell>}
                    </TableRow>))}
                </TableBody>
            </Table>
        </TableContainer>
        {!isHome && <div className="pagination">
            <Pagination
                page={page}
                count={Math.ceil(wordTable.length / rowsPerPage)}
                onChange={handlePageChange}
                renderItem={(item) => {
                    if (item.type === "start-ellipsis" || item.type === "end-ellipsis" || item.type === "page") {
                        return null;
                    }
                    return <PaginationItem {...item} />;
                }}
            />
            <span style={{marginLeft: '1rem'}}>
                    {x}-{y} of {totalElements}
                </span>
        </div>}
    </div>)

}

export default VocabularyTable;