import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { FiUpload } from 'react-icons/fi';
import './styles.css';

interface Props {
    onDrop: (file: File) => void;
};

const Dropzone: React.FC<Props> = ({ onDrop }) => {
    const [selectedFileUrl, setSelectedFileUrl] = useState('');

    const { getRootProps, getInputProps } = useDropzone({
        onDrop: useCallback(acceptedFiles => {
            const [file] = acceptedFiles;

            setSelectedFileUrl(URL.createObjectURL(file));
            onDrop(file);
        }, [onDrop]),
        accept: 'image/*',
    });

    return (
        <div className="dropzone" {...getRootProps()}>
            <input {...getInputProps()} accept="image/*" />
            {selectedFileUrl
                ? <img src={selectedFileUrl} alt="Point." />
                : (
                    <p>
                        <FiUpload />
                        Imagem do estabelecimento
                    </p>
                )
            }
        </div>
    );
};

export default Dropzone;
