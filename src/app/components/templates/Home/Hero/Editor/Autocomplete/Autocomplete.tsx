import {
  memo,
  forwardRef,
  useState,
  useMemo,
  useEffect,
  useRef,
  useCallback,
  useImperativeHandle,
  type Dispatch
} from 'react';
import { flushSync } from 'react-dom';
import styles from './Autocomplete.module.scss';
import { sleep } from '@helpers';
import classNames from 'classnames';
import { random } from 'lodash';

const Autocomplete = memo(
  forwardRef<AutocompleteHandle, AutocompleteProps>(
    ({ isVisible = false, items = [], typedText = '', setIsVisible }, ref) => {
      const [currentIndex, setCurrentIndex] = useState(0);
      const [position, setPosition] = useState({ x: 0, y: 0 });
      const wrapper = useRef<HTMLUListElement>(null);

      // Only show items that contain at least
      // part of the currently typed text
      const matchingItems = useMemo(() => {
        return typedText.endsWith('.')
          ? items.slice()
          : items
              .slice()
              .map((text): [string, number] => {
                let start = '';

                const numMatchedLetters = typedText
                  .split('')
                  .reduce((count, letter) => {
                    const score =
                      start && text.startsWith(start + letter) ? 5 : 1;
                    start += letter;
                    return text.includes(letter) ? count + score : count;
                  }, 0);

                return [text, numMatchedLetters];
              })
              .sort((item1, item2) => item2[1] - item1[1])
              .filter(item => item[1] >= Math.floor(typedText.length / 2))
              .map(item => item[0]);
      }, [items, typedText]);

      const matchingItemsRef = useRef(matchingItems);
      matchingItemsRef.current = matchingItems;

      const components = useMemo(() => {
        const visibleIndex =
          currentIndex < matchingItems.length ? currentIndex : 0;

        return matchingItems.map((text, index) => {
          let itemText: string | (string | JSX.Element)[] = text;

          if (typedText) {
            const parts = text.split(typedText);

            if (parts.length > 1) {
              itemText = [
                parts[0],
                <strong key="bold">{typedText}</strong>,
                parts[1]
              ];
            } else {
              const letters = text.split('');
              let matchedText = '';

              for (let letter of letters) {
                if (!typedText.startsWith(matchedText + letter)) {
                  break;
                }

                matchedText += letter;
              }

              if (matchedText) {
                itemText = [
                  <strong key="bold">{matchedText}</strong>,
                  text.substring(matchedText.length)
                ];
              }
            }
          }

          return (
            <li
              key={index}
              className={classNames({
                [styles.current]: index === visibleIndex
              })}
            >
              {itemText}
            </li>
          );
        });
      }, [matchingItems, typedText, currentIndex]);

      const currentIndexRef = useRef(currentIndex);

      useEffect(() => {
        currentIndexRef.current = currentIndex;
      }, [currentIndex]);

      const selectItem = useCallback(
        async (
          item: string,
          startDelay: number = 250,
          endDelay: number = 160
        ) => {
          setIsVisible(true);
          await sleep(startDelay);

          const start = Math.max(currentIndexRef.current, 0);
          const end = matchingItemsRef.current.indexOf(item);

          if (start === end || end === -1) {
            await sleep(endDelay);
            setIsVisible(false);
            return;
          }

          const isBelow = start < end;
          const minDelay = 140;
          const maxDelay = 180;

          for (
            let i = start;
            isBelow ? i <= end : i >= end;
            isBelow ? i++ : i--
          ) {
            const delay = i === start ? 0 : random(minDelay, maxDelay);
            await sleep(delay);
            setCurrentIndex(i);
          }

          await sleep(endDelay);
          setIsVisible(false);
          setCurrentIndex(0);
        },
        [setIsVisible]
      );

      useImperativeHandle(ref, () => ({ selectItem }));

      useEffect(() => {
        if (isVisible && wrapper.current) {
          const caret = document.querySelector(
            '.visible-code-editor .token.caret'
          );

          if (!caret) {
            return;
          }

          const caretRect = caret.getBoundingClientRect();
          const wrapperRect = wrapper.current.getBoundingClientRect();

          setPosition(prev => {
            return {
              x: caretRect.left - (wrapperRect.left - prev.x),
              y:
                caretRect.top +
                caretRect.height -
                (wrapperRect.top - prev.y) +
                5
            };
          });
        }
      }, [isVisible, typedText]);

      return !components.length ? null : (
        <ul
          ref={wrapper}
          style={{ left: position.x, top: position.y }}
          className={classNames(styles.wrapper, {
            [styles.visible]: isVisible && items.length && typedText
          })}
        >
          {components}
        </ul>
      );
    }
  )
);

Autocomplete.displayName = 'Autocomplete';

export default Autocomplete;

export type AutocompleteHandle = {
  selectItem(item: string): Promise<void>;
};

type AutocompleteProps = {
  isVisible?: boolean;
  items?: string[];
  typedText: string;
  setIsVisible: Dispatch<boolean>;
};

export const autocompleteLists = {
  general: [
    'addEventListener',
    'effects',
    'encodeURI',
    'encodeURIComponent',
    'error',
    'eval',
    'exports',
    'requestAnimationFrame',
    'querySelector'
  ],
  effects: ['addFlair', 'init']
};
