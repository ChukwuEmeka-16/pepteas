
"use client";

import { useEffect, useState } from "react";
import "./peptideModal.scss";
import { doc, setDoc } from "firebase/firestore";
import { db } from "firebase/firebase";

type DosageOption = {
  id: string;
  dosage: string;
  price: string;
};

type Category = "All" | "GLP-1 / Metabolic" | "Growth Hormone" | "Longevity" | "Fat Loss" | "Recovery" | "Skin & Beauty" | "Vitality" | "Antioxidants" | "Stacks";

type ProductTag = "Skin" | "Collagen" | "Energy "| "Anti Aging" |"Fat Loss" |"Recovery" |"Gut Health" | "Anti-inflammatory" | "Sleep" | "Longevity" |"Cellular" | "Antioxidants" | "Growth Hormone" |"Metabolic" |"Fertility" |"Prostate" ;

export type PeptideProduct = {
  name: string;
  description: string;
  category: Category | "";
  tags: ProductTag[];
  id:string;
  variants: {
    dose: string;
    price: number;
  }[];
};

type AddPeptideModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

const CATEGORIES: Category[] = ["GLP-1 / Metabolic", "Growth Hormone", "Longevity", "Fat Loss", "Recovery", "Skin & Beauty", "Vitality", "Antioxidants", "Stacks"];

const AVAILABLE_TAGS: ProductTag[] = [
  "Skin" , "Collagen" , "Energy ", "Anti Aging" ,"Fat Loss" ,"Recovery" ,"Gut Health" , "Anti-inflammatory" , "Sleep" , "Longevity" ,"Cellular" , "Antioxidants" , "Growth Hormone" ,"Metabolic" ,"Fertility" ,"Prostate"
];

export default function AddPeptideModal({
  isOpen,
  onClose
}: AddPeptideModalProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<Category | "">("");
  const [tags, setTags] = useState<ProductTag[]>([]);
  const [dosageOptions, setDosageOptions] = useState<DosageOption[]>([
    { id: crypto.randomUUID(), dosage: "", price: "" },
  ]);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !isSubmitting) {
        onClose();
      }
    };

    document.addEventListener("keydown", handleEscape);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "";
    };
  }, [isOpen, isSubmitting, onClose]);

  if (!isOpen) return null;

  const addDosageOption = () => {
    setDosageOptions((current) => [
      ...current,
      {
        id: crypto.randomUUID(),
        dosage: "",
        price: "",
      },
    ]);
  };

  const removeDosageOption = (id: string) => {
    setDosageOptions((current) =>
      current.filter((option) => option.id !== id)
    );
  };

  const updateDosageOption = (
    id: string,
    field: "dosage" | "price",
    value: string
  ) => {
    setDosageOptions((current) =>
      current.map((option) =>
        option.id === id
          ? { ...option, [field]: value }
          : option
      )
    );
  };

  const toggleTag = (tag: ProductTag) => {
    setTags((current) =>
      current.includes(tag)
        ? current.filter((item) => item !== tag)
        : [...current, tag]
    );
  };

  const resetForm = () => {
    setName("");
    setDescription("");
    setCategory("");
    setTags([]);
    setDosageOptions([
      { id: crypto.randomUUID(), dosage: "", price: "" },
    ]);
    setError("");
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");

    if (!name.trim()) {
      setError("Please enter a product name.");
      return;
    }

    if (!category) {
      setError("Please select a category.");
      return;
    }

    if (dosageOptions.length === 0) {
      setError("Please add at least one dosage option.");
      return;
    }

    const hasInvalidDosage = dosageOptions.some(
      (option) =>
        !option.dosage.trim() ||
        !option.price.trim() ||
        !Number.isFinite(Number(option.price)) ||
        Number(option.price) <= 0
    );

    if (hasInvalidDosage) {
      setError(
        "Every dosage must have a dosage value and a price greater than zero."
      );
      return;
    }

    const normalizedDosages = dosageOptions.map((option) =>
      option.dosage.trim().toLowerCase()
    );

    if (new Set(normalizedDosages).size !== normalizedDosages.length) {
      setError("Each dosage option must be unique.");
      return;
    }

    const product: PeptideProduct = {
      name: name.trim().charAt(0).toUpperCase() + name.trim().slice(1),
      description: description.trim(),
      category,
      tags,
      variants: dosageOptions.map((option) => ({
        dose: option.dosage.trim(),
        price: Number(option.price),
      })),
      id:name.trim().toLowerCase()
    };

    const docRef = doc(db,'products',product.id);

    try {
      setIsSubmitting(true);
      await setDoc(docRef,product).then(()=>{
        resetForm();
        onClose();
        alert("Product added")
      })
    
     
    } catch (err) {
      console.error("Failed to add product:", err);
      setError("Could not add the product. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="peptide-modal-overlay"
      onMouseDown={(event) => {
        if (
          event.target === event.currentTarget &&
          !isSubmitting
        ) {
          onClose();
        }
      }}
    >
      <div
        className="peptide-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="peptide-modal-title"
      >
        <div className="peptide-modal-header">
          <div>
            <h2 id="peptide-modal-title">Add New Product</h2>
            <p>Add a product and configure its dosage prices.</p>
          </div>

          <button
            type="button"
            className="peptide-modal-close"
            onClick={onClose}
            disabled={isSubmitting}
            aria-label="Close modal"
          >
            &times;
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="peptide-modal-body">
            {error && (
              <div className="peptide-form-error" role="alert">
                {error}
              </div>
            )}

            <div className="peptide-form-group">
              <label htmlFor="product-name">Product Name *</label>
              <input
                id="product-name"
                type="text"
                placeholder="Enter product name"
                value={name}
                onChange={(event) => setName(event.target.value)}
                required
              />
            </div>

            <div className="peptide-form-group">
              <label htmlFor="product-description">Description</label>
              <textarea
                id="product-description"
                placeholder="Enter product description"
                rows={4}
                value={description}
                onChange={(event) =>
                  setDescription(event.target.value)
                }
              />
            </div>

            <div className="peptide-form-group">
              <label htmlFor="product-category">Category *</label>
              <select
                id="product-category"
                value={category}
                onChange={(event) =>
                  setCategory(event.target.value as Category | "")
                }
                required
              >
                <option value="">Select a category</option>

                {CATEGORIES.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </div>

            <div className="peptide-form-group">
              <label>Tags</label>

              <div className="peptide-tag-list">
                {AVAILABLE_TAGS.map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    className={`peptide-tag ${
                      tags.includes(tag) ? "selected" : ""
                    }`}
                    onClick={() => toggleTag(tag)}
                    aria-pressed={tags.includes(tag)}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>

            <div className="peptide-dosage-section">
              <div className="peptide-dosage-heading">
                <div>
                  <h3>Dosage & Pricing *</h3>
                  <p>
                    Add each available dosage and its individual price.
                  </p>
                </div>

                <button
                  type="button"
                  className="peptide-add-dosage"
                  onClick={addDosageOption}
                >
                  + Add dosage
                </button>
              </div>

              {dosageOptions.map((option, index) => (
                <div className="peptide-dosage-row" key={option.id}>
                  <div className="peptide-form-group">
                    <label htmlFor={`dosage-${option.id}`}>
                      Dosage {index + 1}
                    </label>

                    <input
                      id={`dosage-${option.id}`}
                      type="text"
                      placeholder="e.g. 5mg, 10mg"
                      value={option.dosage}
                      onChange={(event) =>
                        updateDosageOption(
                          option.id,
                          "dosage",
                          event.target.value
                        )
                      }
                      required
                    />
                  </div>

                  <div className="peptide-form-group">
                    <label htmlFor={`price-${option.id}`}>
                      Price (₦)
                    </label>

                    <input
                      id={`price-${option.id}`}
                      type="number"
                      min="0.01"
                      step="0.01"
                      placeholder="e.g. 15000"
                      value={option.price}
                      onChange={(event) =>
                        updateDosageOption(
                          option.id,
                          "price",
                          event.target.value
                        )
                      }
                      required
                    />
                  </div>

                  <button
                    type="button"
                    className="peptide-remove-dosage"
                    onClick={() => removeDosageOption(option.id)}
                    disabled={dosageOptions.length === 1}
                    aria-label={`Remove dosage ${index + 1}`}
                    title="Remove dosage"
                  >
                    &times;
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="peptide-modal-footer">
            <button
              type="button"
              className="peptide-cancel-button"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </button>

            <button
              type="submit"
              className="peptide-submit-button"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Adding product..." : "Add Product"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
