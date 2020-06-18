import React, { useEffect, useState, ChangeEvent, FormEvent } from 'react';
import { LeafletMouseEvent } from 'leaflet'
import { Link, useHistory } from 'react-router-dom';
import { FiArrowLeft } from 'react-icons/fi';
import { Map, TileLayer, Marker } from 'react-leaflet';
import logo from '../../assets/logo.svg';
import api from '../../services/api';
import ibge from '../../services/ibge';
import './styles.css';

interface Item {
    id: number;
    title: string;
    image_url: string;
};

interface UF {
    sigla: string;
};

interface City {
    nome: string;
};

const CreatePoint = () => {
    const [items, setItems] = useState<Item[]>([]);
    const [ufs, setUfs] = useState<string[]>([]);
    const [cities, setCities] = useState<string[]>([]);

    const [formData, setFormData] = useState({ name: '', email: '', whatsapp: '' });
    const [initialPosition, setInitialPosition] = useState<[number, number]>([0, 0]);
    const [selectedPosition, setSelectedPosition] = useState<[number, number]>([0, 0]);
    const [selectedUf, setSelectedUf] = useState('NA');
    const [selectedCity, setSelectedCity] = useState('NA');
    const [selectedItems, setSelectedItems] = useState<number[]>([]);

    const history = useHistory();

    useEffect(() => {
        api.get<Item[]>('items').then(response => {
            setItems(response.data);
        })
    }, []);

    useEffect(() => {
        ibge.get<UF[]>('localidades/estados').then(response => {
            const ufInitials = response.data.map(uf => uf.sigla);

            setUfs(ufInitials);
        });
    }, []);

    useEffect(() => {
        if (selectedUf === 'NA') {
            return;
        }

        ibge.get<City[]>(`localidades/estados/${selectedUf}/municipios`).then(response => {
            const cityNames = response.data.map(city => city.nome);

            setCities(cityNames);
        });
    }, [selectedUf]);

    useEffect(() => {
        navigator.geolocation.getCurrentPosition(position => {
            const { latitude, longitude } = position.coords;

            setInitialPosition([latitude, longitude]);
        });
    }, []);

    function handleInputChange(event: ChangeEvent<HTMLInputElement>) {
        const { name, value } = event.target;

        setFormData({
            ...formData,
            [name]: value,
        });
    }

    function handleMapClick(event: LeafletMouseEvent) {
        setSelectedPosition([
            event.latlng.lat,
            event.latlng.lng
        ]);
    }

    function handleSelectUf(event: ChangeEvent<HTMLSelectElement>) {
        setSelectedUf(event.target.value);
    }

    function handleSelectCity(event: ChangeEvent<HTMLSelectElement>) {
        setSelectedCity(event.target.value);
    }

    function handleSelectItem(id: number) {
        if (selectedItems.findIndex(item => item === id) >= 0) {
            setSelectedItems(selectedItems.filter(item => item !== id));
        } else {
            setSelectedItems([
                ...selectedItems,
                id
            ]);
        }
    }

    async function handleSubmit(event: FormEvent) {
        event.preventDefault();

        const { name, email, whatsapp } = formData;
        const [latitude, longitude] = selectedPosition;

        await api.post('points', {
            name,
            email,
            whatsapp,
            uf: selectedUf,
            city: selectedCity,
            latitude,
            longitude,
            items: selectedItems,
        });

        alert('Cadastro concluído!');
        history.push('/');
    }

    return (
        <div id="page-create-point">
            <header>
                <img src={logo} alt="Ecoleta" />
                <Link to="/">
                    <FiArrowLeft />
                    Voltar para home
                </Link>
            </header>
            <form onSubmit={handleSubmit}>
                <h1>Cadastro do<br />ponto de coleta</h1>
                <fieldset>
                    <legend>
                        <h2>Dados da entidade</h2>
                    </legend>
                    <div className="field">
                        <label htmlFor="name">Nome da entidade</label>
                        <input
                            id="name"
                            name="name"
                            type="text"
                            onChange={handleInputChange}
                        />
                    </div>
                    <div className="field-group">
                        <div className="field">
                            <label htmlFor="email">Email</label>
                            <input
                                id="email"
                                name="email"
                                type="email"
                                onChange={handleInputChange}
                            />
                        </div>
                        <div className="field">
                            <label htmlFor="whatsapp">WhatsApp</label>
                            <input
                                id="whatsapp"
                                name="whatsapp"
                                type="text"
                                onChange={handleInputChange}
                            />
                        </div>
                    </div>
                </fieldset>
                <fieldset>
                    <legend>
                        <h2>Endereço</h2>
                        <span>Selecione o endereço no mapa</span>
                    </legend>
                    <Map center={initialPosition} zoom={15} onClick={handleMapClick}>
                        <TileLayer
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                            attribution='&amp;copy <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
                        />
                        <Marker position={selectedPosition} />
                    </Map>
                    <div className="field-group">
                        <div className="field">
                            <label htmlFor="uf">Estado</label>
                            <select id="uf" name="uf" value={selectedUf} onChange={handleSelectUf}>
                                <option value="NA">Selecione um estado</option>
                                {ufs.map(uf => (<option value={uf} key={uf}>{uf}</option>))}
                            </select>
                        </div>
                        <div className="field">
                            <label htmlFor="city">Cidade</label>
                            <select
                                name="city"
                                id="city"
                                value={selectedCity}
                                onChange={handleSelectCity}
                                disabled={selectedUf === 'NA'}
                            >
                                <option value="NA">Selecione uma cidade</option>
                                {cities.map(city => (<option value={city} key={city}>{city}</option>))}
                            </select>
                        </div>
                    </div>
                </fieldset>
                <fieldset>
                    <legend>
                        <h2>Ítens de coleta</h2>
                        <span>Selecione um ou mais ítens abaixo</span>
                    </legend>
                    <ul className="items-grid">
                        {items.map(({ id, image_url, title }) => (
                            <li
                                key={id}
                                onClick={() => handleSelectItem(id)}
                                className={selectedItems.includes(id) ? 'selected' : ''}
                            >
                                <img src={image_url} alt={title} />
                                <span>{title}</span>
                            </li>
                        ))}
                    </ul>
                </fieldset>
                <button type="submit">Cadastrar ponto de coleta</button>
            </form>
        </div>
    );
}

export default CreatePoint;
