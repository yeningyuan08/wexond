import styled, { css } from 'styled-components';

import { transparency, icons } from '~/renderer/constants';
import { ITheme } from '~/interfaces';
import { centerIcon } from '~/renderer/mixins';

export const StyledSearchBox = styled.div`
  margin-top: 32px;
  z-index: 2;
  border-radius: 23px;
  margin-bottom: 16px;
  display: flex;
  overflow: hidden;
  flex-flow: column;
  min-height: 42px;
  transition: 0.2s height;
  position: relative;

  ${({ theme }: { theme?: ITheme }) => css`
    background-color: ${theme['overlay.section.backgroundColor']};
  `}
`;

export const SearchIcon = styled.div`
  ${centerIcon()};
  background-image: url(${icons.search});
  height: 16px;
  min-width: 16px;
  margin-left: 16px;

  ${({ theme }: { theme?: ITheme }) => css`
    filter: ${theme['overlay.foreground'] === 'light'
      ? 'invert(100%)'
      : 'none'};
  `}
`;

export const Input = styled.input`
  height: 100%;
  flex: 1;
  width: 100%;
  background-color: transparent;
  border: none;
  outline: none;
  color: white;
  font-size: 14px;
  margin-left: 16px;
  margin-right: 16px;

  ${({ theme }: { theme?: ITheme }) => css`
    color: ${theme['overlay.foreground'] === 'light'
      ? 'white'
      : `rgba(0, 0, 0, ${transparency.text.high})`};

    &::placeholder {
      color: rgba(255, 255, 255, 0.54);

      color: ${theme['overlay.foreground'] === 'light'
        ? `rgba(255, 255, 255, ${transparency.text.medium})`
        : `rgba(0, 0, 0, ${transparency.text.medium})`};
    }
  `}
`;

export const InputContainer = styled.div`
  display: flex;
  align-items: center;
  min-height: 42px;
  height: 42px;
`;
