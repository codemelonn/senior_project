# Configuration file for the Sphinx documentation builder.
#
# For the full list of built-in configuration values, see the documentation:
# https://www.sphinx-doc.org/en/master/usage/configuration.html

# -- Project information -----------------------------------------------------
# https://www.sphinx-doc.org/en/master/usage/configuration.html#project-information

import os
import sys

# Directory containing conf.py → senior_project/docs
CONF_DIR = os.path.dirname(os.path.abspath(__file__))

# Project root → senior_project
PROJECT_ROOT = os.path.abspath(os.path.join(CONF_DIR, ".."))

# Backend directory → senior_project/backend
BACKEND_DIR = os.path.join(PROJECT_ROOT, "backend")

sys.path.insert(0, BACKEND_DIR)

print("CONF_DIR:", CONF_DIR)
print("PROJECT_ROOT:", PROJECT_ROOT)
print("BACKEND_DIR:", BACKEND_DIR)
print("sys.path[0]:", sys.path[0])

project = 'TryCatch(Bias)'
copyright = '2025, Dominik Trujillo, Pauline Rosales, Amara Barton'
author = 'Dominik Trujillo, Pauline Rosales, Amara Barton'

# -- General configuration ---------------------------------------------------
# https://www.sphinx-doc.org/en/master/usage/configuration.html#general-configuration

extensions = [
    "sphinx.ext.autodoc",
    "sphinx.ext.napoleon",  # Google/NumPy docstrings
    "sphinx.ext.viewcode"
]

templates_path = ['_templates']
exclude_patterns = ['_build', 'Thumbs.db', '.DS_Store']



# -- Options for HTML output -------------------------------------------------
# https://www.sphinx-doc.org/en/master/usage/configuration.html#options-for-html-output

html_theme = 'alabaster'
html_static_path = ['_static']
