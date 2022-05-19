import {
  memo,
  forwardRef,
  useState,
  useMemo,
  useEffect,
  useRef,
  useCallback,
  useImperativeHandle,
  type Dispatch,
  type SetStateAction
} from 'react';
import styles from './Autocomplete.module.scss';
import { sleep } from '@helpers';
import classNames from 'classnames';

const Autocomplete = memo(
  forwardRef<AutocompleteHandle, AutocompleteProps>(
    ({ isVisible = false, items = [], typedText, setIsVisible }, ref) => {
      const [currentIndex, setCurrentIndex] = useState(0);
      const [position, setPosition] = useState({ x: 0, y: 0 });
      const wrapper = useRef<HTMLUListElement>(null);

      // Only show items that contain at least
      // part of the currently typed text
      const matchingItems = useMemo(() => {
        return items
          .map((text): [string, number] => {
            let start = '';

            const numMatchedLetters = typedText
              .split('')
              .reduce((count, letter) => {
                const score = start && text.startsWith(start + letter) ? 5 : 1;
                start += letter;
                return text.includes(letter) ? count + score : count;
              }, 0);

            return [text, numMatchedLetters];
          })
          .sort((item1, item2) => item2[1] - item1[1])
          .filter(item => item[1] >= Math.floor(typedText.length / 2))
          .map(item => item[0]);
      }, [items, typedText]);

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

      const selectItem = useCallback(
        async (item: string) => {
          setIsVisible(true);
          console.log(`Selecting ${item}`);
          await sleep(1000);
          console.log(`Finished selecting ${item}`);
          setIsVisible(false);
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
