import { NgIf } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-press-detail',
  templateUrl: './press-detail.component.html',
  styleUrls: ['./press-detail.component.scss'],
  imports: [NgIf],
  standalone: true,
})
export class PressDetailComponent implements OnInit {
  press: any;

  articles = [
    {
      id: 1,
      title: 'DJ Seborn Breaks the Mold',
      image: 'assets/press/detail1.jpg',
      content: 'An in-depth story about how DJ Seborn is revolutionizing the music scene.',
      url: 'https://example.com/press/dj-seborn',
    },
    {
      id: 2,
      title: 'The Future of Electronic Music',
      image: 'assets/press/detail2.jpg',
      content: 'Exploring trends and DJ Seborn’s role in upcoming electronic music.',
      url: 'https://example.com/press/electronic-music',
    },
  ];

  constructor(private route: ActivatedRoute) {}

  ngOnInit() {
    const idStr = this.route.snapshot.paramMap.get('id');
    const id = idStr ? Number(idStr) : NaN;
    this.press = this.articles.find(article => article.id === id);
  }
}
