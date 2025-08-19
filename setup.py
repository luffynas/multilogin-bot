#!/usr/bin/env python3
"""
Setup script for Multi-Login Bot
"""

from setuptools import setup, find_packages
import os

# Read README file
def read_readme():
    with open("README.md", "r", encoding="utf-8") as fh:
        return fh.read()

# Read requirements
def read_requirements():
    with open("requirements.txt", "r", encoding="utf-8") as fh:
        return [line.strip() for line in fh if line.strip() and not line.startswith("#")]

setup(
    name="multi-login-bot",
    version="1.0.0",
    author="Multi-Login Bot Team",
    author_email="support@example.com",
    description="Undetectable traffic simulator using Multilogin and SOCKS5 proxies",
    long_description=read_readme(),
    long_description_content_type="text/markdown",
    url="https://github.com/yourusername/multi-login-bot",
    packages=find_packages(),
    classifiers=[
        "Development Status :: 4 - Beta",
        "Intended Audience :: Developers",
        "License :: OSI Approved :: MIT License",
        "Operating System :: OS Independent",
        "Programming Language :: Python :: 3",
        "Programming Language :: Python :: 3.8",
        "Programming Language :: Python :: 3.9",
        "Programming Language :: Python :: 3.10",
        "Programming Language :: Python :: 3.11",
        "Topic :: Internet :: WWW/HTTP :: Browsers",
        "Topic :: Software Development :: Testing",
    ],
    python_requires=">=3.8",
    install_requires=read_requirements(),
    entry_points={
        "console_scripts": [
            "multi-login-bot=src.main:main",
        ],
    },
    include_package_data=True,
    package_data={
        "": ["*.yaml", "*.yml", "*.json"],
    },
    keywords="multilogin, proxy, bot, automation, traffic, simulation",
    project_urls={
        "Bug Reports": "https://github.com/yourusername/multi-login-bot/issues",
        "Source": "https://github.com/yourusername/multi-login-bot",
        "Documentation": "https://github.com/yourusername/multi-login-bot#readme",
    },
)
