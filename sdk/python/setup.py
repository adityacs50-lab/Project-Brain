from setuptools import setup, find_packages

setup(
    name="statelock",
    version="0.1.0",
    description="Deterministic Governance Layer for AI Agents",
    author="StateLock Team",
    packages=find_packages(),
    install_requires=[
        "requests>=2.25.0",
    ],
    classifiers=[
        "Programming Language :: Python :: 3",
        "License :: OSI Approved :: MIT License",
        "Operating System :: OS Independent",
    ],
    python_requires='>=3.7',
)
