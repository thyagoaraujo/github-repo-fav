import React, { Component } from 'react';
import { FaGithubAlt, FaPlus, FaSpinner } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import Container from '../../components/Container';
import { Form, FormInput, SubmitButton, List } from './styles';

export default class Main extends Component {
  state = {
    newRepo: '',
    repositories: [],
    loading: false,
    error: '',
  };

  // Carregar os dados do localStorage
  componentDidMount() {
    const repositories = localStorage.getItem('repositories');

    if (repositories) {
      this.setState({ repositories: JSON.parse(repositories) });
    } else {
      this.setState({
        repositories: [
          {
            name: 'thyagoaraujo/gobarber',
            ownerAvatar:
              'https://avatars0.githubusercontent.com/u/42300657?v=4',
          },
        ],
      });
    }
  }

  // Salvar os dados do localStorage
  componentDidUpdate(_, prevState) {
    const { repositories } = this.state;
    if (prevState.repositories !== repositories) {
      localStorage.setItem('repositories', JSON.stringify(repositories));
    }
  }

  handleInputChange = e => {
    this.setState({ newRepo: e.target.value, error: false });
  };

  handleSubmit = async e => {
    e.preventDefault();

    this.setState({ loading: true });

    try {
      const { newRepo, repositories } = this.state;

      const response = await api.get(`/repos/${newRepo}`);

      const data = {
        name: response.data.full_name,
        ownerAvatar: response.data.owner.avatar_url,
      };

      if (repositories.find(repo => repo.name === data.name)) {
        throw new Error('Duplicated repository');
      }

      this.setState({
        repositories: [...repositories, data],
        newRepo: '',
        loading: false,
        error: '',
      });
    } catch (err) {
      this.setState({
        loading: false,
        error: err.message.includes('404')
          ? 'Repository not found'
          : err.message,
      });
    }
  };

  render() {
    const { newRepo, repositories, loading, error } = this.state;

    return (
      <Container>
        <h1>
          <FaGithubAlt />
          Repositórios
        </h1>

        <Form onSubmit={this.handleSubmit}>
          <FormInput
            type="text"
            placeholder="Adicionar repositório"
            value={newRepo}
            onChange={this.handleInputChange}
            loading={loading}
            error={error}
          />

          <SubmitButton loading={loading} disabled={!newRepo.length}>
            {loading ? (
              <FaSpinner color="#FFF" size={14} />
            ) : (
              <FaPlus color="#FFF" size={14} />
            )}
          </SubmitButton>
          {error && <div className="error">{error}</div>}
        </Form>

        <List>
          {repositories.map(repository => (
            <li key={repository.name}>
              <Link to={`/repository/${encodeURIComponent(repository.name)}`}>
                <img src={repository.ownerAvatar} alt={repository.name} />
                <span>{repository.name}</span>
              </Link>
            </li>
          ))}
        </List>
      </Container>
    );
  }
}
