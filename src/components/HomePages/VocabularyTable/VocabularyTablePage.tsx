import "./VocabularyTablePage.scss";
import { useEffect, useState } from "react";
import ArrowOutwardIcon from "@mui/icons-material/ArrowOutward";
import VocabularyTable from "./VocabularyTable";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import { CircularProgress, Alert, Dialog } from "@mui/material";
import PublishIcon from "@mui/icons-material/Publish";
import { useNavigate } from "react-router-dom";
import { Category } from "../../../types/api";
import { VocabularyTableRow } from "../../../types/practice";
import { useAddVocabulary, useCategories, useVocabulary } from "../../../api/vocabularyService";
import { useSaveLanguage } from "../../../api/userService";
import { useActiveLanguageSelection } from "../../../hooks/useActiveLanguageSelection";

interface AlertState {
  open: boolean;
  message: string;
  type: "success" | "error";
}

function VocabularyTablePage() {
  const { data: wordTable = [] } = useVocabulary();
  const { data: categories = [] } = useCategories();
  const addVocabulary = useAddVocabulary();
  const saveLanguage = useSaveLanguage();
  const { activeLanguage, settings, country, activeLanguageOption } =
    useActiveLanguageSelection();
  const [openModal, setOpenModal] = useState(false);
  const [openConfirmModal, setOpenConfirmModal] = useState(false);
  const [words, setWords] = useState("");
  const [alert, setAlert] = useState<AlertState>({
    open: false,
    message: "",
    type: "success",
  });
  const [isAlertHovered, setIsAlertHovered] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [categoryDialogOpen, setCategoryDialogOpen] = useState(false);

  const navigate = useNavigate();
  const filteredTable = wordTable.filter((word) => {
    return word.minutesUntilDue <= 0;
  });

  function cleanString(str: string) {
    return str
      .replace(
        /[^a-zA-Z\u00C0-\u017F\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF\uFF00-\uFFEF\s]/g,
        ""
      )
      .replace(/\s+/g, " ")
      .trim();
  }

  useEffect(() => {
    if (alert.open && !isAlertHovered) {
      const timer = setTimeout(() => {
        if (!isAlertHovered) {
          setAlert({ ...alert, open: false });
        }
      }, 5000);

      return () => {
        clearTimeout(timer);
      };
    }
  }, [alert, isAlertHovered]);

  function sanitizeInput(input: string) {
    return input.replace(/[^\u0000-\u007F]/g, function (char) {
      return "\\u" + char.charCodeAt(0).toString(16).padStart(4, "0");
    });
  }

  async function addWords(wordsToAdd: string) {
    if (!activeLanguage) return;
    let cleanWords = sanitizeInput(cleanString(wordsToAdd.toLowerCase()));

    const wordsArray = cleanWords.split(/\s+/);

    if (wordsArray.length > 50) {
      wordsArray.length = 50;
    }

    const limitedWordsArray = wordsArray.slice(0, 50);

    try {
      const addedWords = await addVocabulary.mutateAsync({
        language: activeLanguage,
        vocabulary: limitedWordsArray,
      });
      setAlert({
        open: true,
        message: `Added words: ${addedWords}`,
        type: "success",
      });
    } catch {
      setAlert({
        open: true,
        message: `Error adding vocabulary`,
        type: "error",
      });
    } finally {
      setOpenModal(false);
    }
  }

  async function onAddWords() {
    if (words.length === 0) return;
    setWords("");
    addWords(words);
  }

  function handleModalClose() {
    if (words.length > 0) setOpenConfirmModal(true);
    else setOpenModal(false);
  }

  const isAddingVocabulary = addVocabulary.isPending;

  return (
    <div className="main-content">
      <div className="content-container">
        {alert.open && (
          <Alert
            severity={alert.type}
            onClose={() => setAlert({ ...alert, open: false })}
            onMouseEnter={() => setIsAlertHovered(true)}
            onMouseLeave={() => setIsAlertHovered(false)}
            className="alert"
          >
            {alert.message}
          </Alert>
        )}
        <div className="header-container">
          <div className="txt big">
            <strong>Your vocabulary for {activeLanguage}</strong>
          </div>
          <img className="flag-img big" src={country?.flag} alt="" />
        </div>
        <div className="welcome-container">
          <div className="add-vocab-button-wrapper">
            <button
              className="add-vocab-button button blue"
              onClick={() => setOpenModal(true)}
            >
              <div className="button-txt">Add Vocabulary</div>
              <div className="popup-wrapper">
                <ArrowOutwardIcon />
              </div>
            </button>
          </div>
          {filteredTable.length > 0 &&
            (settings?.exercises.translation ||
              settings?.exercises.listening ||
              settings?.exercises.speaking) && (
              <div className="practice-button-wrapper">
                <button
                  onClick={async () => {
                    try {
                      if (activeLanguageOption) {
                        await saveLanguage.mutateAsync(activeLanguageOption);
                      }
                      navigate("/practice");
                    } catch {
                      return;
                    }
                  }}
                  className="practice-btn button"
                >
                  <div className="button-txt">PRACTICE</div>
                  <div className="arrow-wrapper">
                    <ArrowForwardIcon fontSize="inherit" />
                  </div>
                </button>
              </div>
            )}
        </div>
        <div className="vocab-table-page-wrapper">
          <div className="categories-grid">
            {categories.map((category, index) => (
              <button
                key={index}
                className="category-square button true-center"
                onClick={() => {
                  setSelectedCategory(category);
                  setCategoryDialogOpen(true);
                }}
              >
                {category.name}
              </button>
            ))}
          </div>
          <VocabularyTable wordTable={wordTable} />
        </div>
      </div>
      <Dialog
        open={openModal}
        onClose={handleModalClose}
        scroll="body"
        maxWidth="lg"
        fullWidth={true}
      >
        <div className="modal-container">
          <div className="header-container">
            <div className="txt">
              <div>
                Add to your <strong>{activeLanguage}</strong> vocabulary list
              </div>
            </div>
          </div>
          <textarea
            className="txt-field"
            placeholder="Add your vocabulary here..."
            onChange={(e) => setWords(e.target.value)}
          />
          <button
            className="button submit-vocab-button blue"
            onClick={onAddWords}
            disabled={isAddingVocabulary}
          >
            {isAddingVocabulary ? (
              <div className="button-txt" style={{ color: "white" }}>
                <CircularProgress size="18px" color="inherit" />
              </div>
            ) : (
              <>
                <div className="button-txt">Add vocabulary</div>
                <div className="popup-wrapper">
                  <PublishIcon />
                </div>
              </>
            )}
          </button>
          <button className="button close-modal-button" onClick={handleModalClose}>
            Cancel
          </button>
        </div>
      </Dialog>
      <ConfirmModal
        open={openConfirmModal}
        onClose={() => setOpenConfirmModal(false)}
        onConfirm={() => setOpenModal(false)}
      />
      <CategoryDialog
        open={categoryDialogOpen}
        onClose={() => setCategoryDialogOpen(false)}
        category={selectedCategory}
        wordTable={wordTable}
        addWords={(nextWords) => addWords(nextWords)}
        isAddingVocabulary={isAddingVocabulary}
      />
    </div>
  );
}

export default VocabularyTablePage;

function CategoryDialog({
  open,
  onClose,
  category,
  wordTable,
  addWords,
  isAddingVocabulary,
}: {
  open: boolean;
  onClose: () => void;
  category: Category | null;
  wordTable: VocabularyTableRow[];
  addWords: (words: string) => void;
  isAddingVocabulary: boolean;
}) {
  if (!category) return null;
  const wordsForCategory = category.words;
  const combinedTable: VocabularyTableRow[] = wordsForCategory.map((word) => {
    const wordObj = wordTable.find((w) => w.word === word.word);
    const foundInWordTable = !!wordObj;
    return { ...wordObj, ...word, foundInWordTable };
  });

  const addAllWords = () => {
    addWords(
      wordsForCategory
        .map((word) => word.word)
        .toString()
        .split(",")
        .join(" ")
    );
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg">
      <div className="modal-container">
        <div className="header-container">
          <strong className="txt">Category: {category.name}</strong>
        </div>
        <button className="button blue add-words-btn" onClick={addAllWords}>
          {isAddingVocabulary ? <CircularProgress size={20} /> : "Add All Words"}
        </button>
        <VocabularyTable
          isCategoryView={true}
          wordTable={combinedTable}
          addWords={addWords}
          isAddingVocabulary={isAddingVocabulary}
        />
        <button className="button close-modal-button" onClick={onClose}>
          Close
        </button>
      </div>
    </Dialog>
  );
}

function ConfirmModal({
  open,
  onClose,
  onConfirm,
}: {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
}) {
  function handleConfirmClose(shouldClose: boolean) {
    if (shouldClose) onConfirm();
    onClose();
  }

  return (
    <Dialog open={open} onClose={onClose}>
      <div className="modal-container">
        <div className="header-container" style={{ marginBottom: "20px" }}>
          <div style={{ fontSize: "20px" }}>Close without saving?</div>
        </div>
        <div className="modal-buttons-container">
          <button
            className="button confirm-button"
            onClick={() => handleConfirmClose(true)}
          >
            <div className="button-txt">Do not save</div>
          </button>
          <button
            className="button cancel-button"
            onClick={() => handleConfirmClose(false)}
          >
            <div className="button-txt">Cancel</div>
          </button>
        </div>
      </div>
    </Dialog>
  );
}
